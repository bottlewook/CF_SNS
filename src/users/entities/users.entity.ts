import { Column, Entity, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.keys(RolesEnum),
    default: RolesEnum.USER,
  })
  Role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
