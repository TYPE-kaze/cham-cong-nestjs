import { IsEmail, IsNotEmpty, IsNotIn, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, Matches, ValidateIf } from "class-validator";

export class ChangePasswordDTO {
	@IsNotEmpty()
	@IsString()
	passwordOld: string;

	@IsNotEmpty()
	@IsString()
	password: string;

}
