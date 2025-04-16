import { IsEmail, IsNotEmpty, IsNotIn, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, Matches, ValidateIf } from "class-validator";

export class ChangePassWDDTO {
	@IsNotEmpty()
	@IsString()
	passwordOld: string;

	@IsNotEmpty()
	@IsString()
	password: string;

}
