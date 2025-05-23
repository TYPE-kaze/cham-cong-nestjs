import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsShift(validationOptions?: ValidationOptions) {
	return (object: any, propertyName: string) => {
		registerDecorator({
			name: 'IsShift',
			target: object.constructor,
			propertyName,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					for (const sh in value) {
						const timeRegex = /^\d\d:\d\d$/
						const { startTime, endTime } = value[sh]
						if (!timeRegex.test(startTime)) return false
						if (!timeRegex.test(endTime)) return false
						const [startH, startM] = startTime.split(':').map((e) => parseInt(e))
						const [endH, endM] = endTime.split(':').map((e) => parseInt(e))
						if (startH >= endH) return false
					}
					return true
				},
				defaultMessage(args: ValidationArguments) {
					return 'Lỗi cài đặt ca làm';
				},
			},
		});
	};
}