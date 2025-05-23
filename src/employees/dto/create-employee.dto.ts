import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotIn, IsOptional, IsPhoneNumber, Matches } from "class-validator";
import { IsEmployeeShift } from "../decorators/is-employee-shift.decorator";
const vnNameCS = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỳỵỷỹýÝ\s]+$/;
export class CreateEmployeeDTO {
	@Matches(vnNameCS, { message: "Tên chứa kí tự đặc biệt hoặc không hợp lệ" })
	name: string;

	@Transform(({ value }) => value === '' ? undefined : value)
	@IsOptional()
	// @ValidateIf((o) => o.phone !== '')
	@IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ" })
	phone?: string;

	@IsEmail({}, { message: "Email không hợp lệ" })
	@IsNotIn(['checker'])
	email: string;

	@IsEmployeeShift()
	shift: string;
}