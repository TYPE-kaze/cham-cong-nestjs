import { IsEmail, IsNotEmpty, IsNotIn, IsOptional, IsPhoneNumber, isPhoneNumber, IsString, Matches, ValidateIf } from "class-validator";

export class CreateEmployeeDTO {
	@IsNotEmpty()
	@IsString()
	@Matches(/^[^0-9]+$/) //TODO: whitelist rather than blacklist
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
	@IsPhoneNumber("VN")
	phone?: string;

}