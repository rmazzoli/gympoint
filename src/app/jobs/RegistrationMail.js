import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const {
      studentName,
      studentEmail,
      planTitle,
      end_date,
      planPrice,
      TotalPrice,
    } = data;

    await Mail.sendMail({
      from: 'Equipe GoBarber <noreply@gobarber.com>',
      to: `${studentName} <${studentEmail}>`,
      subject: 'Matrícula Efetuada - Seja bem-vindo',
      template: 'registration',
      context: {
        user: studentName,
        planTitle,
        endDate: format(parseISO(end_date), "'Dia' dd 'de' MMMM' de 'yyyy", {
          locale: pt,
        }),
        priceMonth: planPrice,
        priceTotal: TotalPrice,
      },
    });
  }
}

export default new RegistrationMail();
