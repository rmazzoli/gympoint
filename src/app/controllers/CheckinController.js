import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Not found this student' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: id,
        created_at: { [Op.between]: [subDays(new Date(), 7), new Date()] },
      },
    });

    if (checkins.length >= 5) {
      return res.status(400).json({ error: 'Exceeded checkins number' });
    }

    const checkin = await Checkin.create({ student_id: id });

    return res.json(checkin);
  }

  async index(req, res) {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Not found this student' });
    }

    const checkins = await Checkin.findAll({
      where: { student_id: id },
      order: ['id'],
    });

    return res.json(checkins);
  }
}

export default new CheckinController();
