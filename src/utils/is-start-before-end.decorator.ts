import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsStartBeforeEnd(property: string, validationOptions?: ValidationOptions) {
	return function (object: any, propertyName: string) {
		registerDecorator({
			name: 'isStartBeforeEnd',
			target: object.constructor,
			propertyName,
			constraints: [property],
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					const relatedPropertyName = args.constraints[0];
					const relatedValue = (args.object as any)[relatedPropertyName];
					if (!value || !relatedValue) return true;

					const [sh, sm] = value.split(':').map(Number);
					const [eh, em] = relatedValue.split(':').map(Number);
					return sh * 60 + sm < eh * 60 + em;
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} must be before ${args.constraints[0]}`;
				},
			},
		});
	};
}
