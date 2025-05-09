import { IsNotEmpty } from "class-validator";

export class ChangePasswordDTO {
	@IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
	passwordOld: string;

	@IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
	password: string;

}
