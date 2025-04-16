import { IsEmail, IsNotEmpty, IsNotIn, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, Matches, ValidateIf } from "class-validator";

export class CreateEmployeeDTO {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	@IsEmail()
	@IsNotIn(['checker'])
	email: string;

	// @IsNotEmpty()
	// @IsString()
	// password: string;

	@IsString()
	@IsOptional()
	@ValidateIf((o) => o.phone !== '')
	@Matches(/^[0-9]+$/, { message: "Phone number must contain only digits" })
	phone?: string;

}