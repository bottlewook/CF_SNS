import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly JwtServices: JwtService,
    private readonly usersService: UsersService,
  ) { }
  /**
   * 우리가 만드려는 기능
   *
   * 1) registerWithEmail
   *  - email, nickname, password를 입력 받고 사용자를 생성한다.
   *  - 생성이 완료되면 accessToken, refreshToken을 반환한다.
   *
   *
   *  2) loginWithEmail
   *  - email, password를 입력하면 사용자 검증을 진행한다.
   *  - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
   *
   *  3) loginUser
   *  - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 로직
   *
   *  4) signToken
   *  - (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직
   *
   *  5) authenticatedWithEmailAndPassword
   *  - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *    1. 사용자가 존재하는지 확인 (email)
   *    2. 비밀번호가 맞는지 확인
   *    3. 모두 통과되면 찾은 사용자 정보 반환
   *    4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   */

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.JwtServices.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticatedWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticatedWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }
}
