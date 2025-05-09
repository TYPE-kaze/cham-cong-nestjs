import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			name: 'IsNotFutureDate',
			target: object.constructor,
			propertyName,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					if (!value) return true;
					const date = new Date(value)
					const curDate = new Date()
					return date <= curDate
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} can not be a date from future`;
				},
			},
		});
	};
}

