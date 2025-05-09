import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FlashError } from 'src/flash-error';
import xlsx from 'xlsx';

@Injectable()
export class FileValidationPipe implements PipeTransform {
	// value: {
	// 	fieldname: 'formFile',
	// 	originalname: 'bao_cao_202503030817.xlsx',
	// 	encoding: '7bit',
	// 	mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	// 	buffer: <Buffer 50 4b 03 04 14 00 08 08 08 00 38 34 9c 5a 00 00 00 00 00 00 00 00 00 00 00 00 1a 00 00 00 78 6c 2f 5f 72 65 6c 73 2f 77 6f 72 6b 62 6f 6f 6b 2e 78 6d ... 23950 more bytes>,
	// 	size: 24000
	// }
	transform(value: any, metadata: ArgumentMetadata) {
		if (!value) throw new FlashError('Chưa nhập file Excel')
		if (
			!(typeof value.originalname === 'string' && value.originalname.endsWith('.xlsx'))
			|| value.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			|| !xlsx.read(value.buffer, { type: 'buffer' }).Workbook
		) {
			throw new FlashError('File không đúng định dạng')
		}
		return value
	}
}
