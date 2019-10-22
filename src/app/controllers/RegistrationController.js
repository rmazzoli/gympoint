import * as Yup from 'yup';

import { parseISO, isBefore, addMonths } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plans';
import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registration = await Registration.findAll({
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'price'],
        },
      ],
    });

    return res.json(registration);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check de student is not registered
     */
    const studentRegistered = await Registration.findOne({
      where: { student_id },
    });

    if (studentRegistered) {
      return res.status(400).json({ error: 'This student has registered' });
    }

    /**
     * Check if student_id exists
     */

    const student = await Student.findOne({
      where: { id: student_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Need to inform existing student' });
    }

    /**
     * Check if plan_id exists
     */

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!plan) {
      return res.status(400).json({ error: 'Need to inform existing plan' });
    }

    /**
     * Check for past dates
     */
    const pastDate = parseISO(start_date);

    if (isBefore(pastDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    /**
     * Add months the plan to start_date and calculate de total price
     */
    const end_date = addMonths(pastDate, plan.duration);

    const price = plan.price * plan.duration;

    /**
     * Create new registration
     */
    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Queue.add(RegistrationMail.key, {
      studentName: student.name,
      studentEmail: student.email,
      planTitle: plan.title,
      end_date,
      planPrice: plan.price,
      TotalPrice: price,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number(),
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check de student is registered
     */
    const registration = await Registration.findOne({ where: { student_id } });

    if (!registration) {
      return res.status(400).json({ error: 'This student has registered' });
    }

    /**
     * Check if plan_id exists
     */
    const existsPlan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (plan_id && plan_id !== existsPlan.id) {
      return res.status(400).json({ error: 'Need to inform existing plan' });
    }

    /**
     * Check for past dates
     */
    const pastDate = parseISO(start_date);

    if (start_date && isBefore(pastDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    /**
     * Add months the plan to start_date and calculate de total price
     */

    const plan = await Plan.findByPk(plan_id);
    const { price, duration } = plan;
    const total_price = duration * price;

    const end_date = addMonths(
      start_date ? parseISO(start_date) : registration.start_date,
      duration
    );

    const { id } = await registration.update({
      ...req.body,
      price: total_price,
      end_date,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      end_date,
      total_price,
    });
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id, {
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'price'],
        },
      ],
    });

    registration.canceled_at = new Date();

    await registration.save();

    return res.json(registration);
  }
}

export default new RegistrationController();
