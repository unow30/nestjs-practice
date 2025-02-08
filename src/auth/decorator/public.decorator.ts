import { Reflector } from '@nestjs/core';

//authGuard 를 통과시키는 목적으로 만든 데코레이터
//제내릭으로 입력가능한 변수의 타입도 지정 가능
export const Public = Reflector.createDecorator();
