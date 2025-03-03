import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { envVariableKeys } from '../common/const/env.const';

dotenv.config();

export default new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*.js'],
  ...(process.env.ENV === 'prod' && {
    //ssl 설정 배포환경에서만 적용
    //db 연결을 ssl 을 사용하여 암호화a
    ssl: {
      // 자체서명 또는 신뢰할 수 없는 인증서를 허용(개발시만)
      rejectUnauthorized: false,
    },
  }),
});
