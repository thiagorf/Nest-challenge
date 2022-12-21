import { Finance } from 'src/finances/entities/finance.entity';

export class User {
  id: number;
  name: string;
  email: string;
  password: string;
  finances?: Finance[];
}
