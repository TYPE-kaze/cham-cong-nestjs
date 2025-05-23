import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ConfigService } from 'src/config/config.service';

export function IsEmployeeShift(validationOptions?: ValidationOptions) {
	return (object: any, propertyName: string) => {
		registerDecorator({
			name: 'IsEmployeeShift',
			target: object.constructor,
			propertyName,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					for (const sh of ConfigService.config.shifts) {
						if (value === sh.kind) return true
					}
					return false
				},
				defaultMessage(args: ValidationArguments) {
					return 'Không phải là ca hợp lệ';
				},
			},
		});
	};
}