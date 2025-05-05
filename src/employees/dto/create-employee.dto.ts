import { IsEmail, IsNotEmpty, IsNotIn, IsOptional, IsPhoneNumber, IsString, Matches, ValidateIf } from "class-validator";
const vnName = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỳỵỷỹýÝ\s]+$/;

export class CreateEmployeeDTO {
	@IsNotEmpty()
	@IsString()
	@Matches(vnName, { message: "Tên chứa kí tự đặc biệt hoặc không hợp lệ" })
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

	@IsString()
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'Time must be in the format HH:mm:ss',
	})
	startWorkTime: string;


	@IsString()
	@Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/, {
		message: 'Time must be in the format HH:mm:ss',
	})
	endWorkTime: string;
}