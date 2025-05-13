import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotIn, IsOptional, IsPhoneNumber, Matches } from "class-validator";
import { workShifts } from "src/constants/work-shift";
import { IsStartBeforeEnd } from "src/utils/is-start-before-end.decorator";
const vnNameCS = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềếềểẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỳỵỷỹýÝ\s]+$/;
const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])(:([0-5]?[0-9]))?$/
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
	@IsIn(Object.getOwnPropertyNames(workShifts))
	shift: string;
}