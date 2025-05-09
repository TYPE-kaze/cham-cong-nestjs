import { IsString } from "class-validator";

export class UpdateReasonDTO {
	@IsString()
	reason: string;
}
