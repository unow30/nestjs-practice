import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //만약 public decorator 가 있으면 모든 로직을 bypass
    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    console.log(isPublic);
    //요청에서 user 객체가 존재하는지 확인한다.
    const request = context.switchToHttp().getRequest();
    return !(!request.user || request.user.type !== 'access');

    // throw new Error('Method not implemented.');
  }
}
