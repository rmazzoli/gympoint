import * as Yup from 'yup';
import Plan from '../models/Plans';

class PlanController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const plan = await Plan.findAll({
      order: [['price', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plan);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Check the title of plan exists
     */

    const planExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (planExists) {
      return res
        .status(400)
        .json({ error: 'The title of plan already exists.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(401).json({ error: 'Plan not found' });
    }

    if (title && title !== plan.title) {
      const planExists = await Plan.findOne({
        where: { title },
      });

      if (planExists) {
        return res
          .status(400)
          .json({ error: 'The title of plan already exists.' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(401).json({
        error: 'The plan not found',
      });
    }

    /**
     * Adicionar regras de negócio... não pode ser permitido apagar se tiver
     * plano ativo com um usuáiro... o correto aqui seria desabilitar o plano
     */
    await plan.destroy();

    return res.json({ success: 'The plan removed' });
  }
}

export default new PlanController();
