import { Transform } from "class-transformer";
import { IsEmail, IsEmpty, IsNotEmpty, IsNotIn, IsOptional, IsPhoneNumber, IsString, Matches, ValidateIf } from "class-validator";
import { IsStartBeforeEnd } from "src/utils/is-start-before-end.decorator";
const vnNameCS = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỳỵỷỹýÝ\s]+$/;
const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/
export class CreateEmployeeDTO {
	@Matches(vnNameCS, { message: "Tên chứa kí tự đặc biệt hoặc không hợp lệ" })
	name: string;

	@IsEmail({}, { message: "Email không hợp lệ" })
	@IsNotIn(['checker'])
	email: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	// @ValidateIf((o) => o.phone !== '')
	@IsPhoneNumber("VN")
	phone?: string;

	@IsStartBeforeEnd('endWorkTime', { message: 'Giờ làm việc phải trước giờ tan làm' })
	@Matches(timeRegex, { message: 'Giờ làm việc không hợp lệ' })
	startWorkTime: string;

	@Matches(timeRegex, { message: 'Giờ làm việc không hợp lệ', })
	endWorkTime: string;
}