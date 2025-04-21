import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { WorktimeRule } from "./wtr.model";
import { FlashError } from "src/flash-error";
import { Op } from "sequelize";

@Injectable()
export class WorktimeRuleService {
	constructor(@InjectModel(WorktimeRule) private readonly worktimeRuleModel: typeof WorktimeRule) { }
	async createOne(fromDate: string, startTime: string, endTime: string, deltaMins: number) {
		const oRule = await this.worktimeRuleModel.findOne({ where: { fromDate } })
		if (oRule) {
			throw new FlashError(`Đã có luật áp dụng từ ngày ${fromDate}. Xóa luật đó trước khi tao luật mới`)
		}
		const wtr = new WorktimeRule({ fromDate, startTime, endTime, deltaMins })
		return await wtr.save()
	}

	async getAll() {
		const rules = await this.worktimeRuleModel.findAll({
			order: [['fromDate', 'DESC']],
			raw: true
		})
		return rules
	}

	async getCurrentAppliedRule() {
		const today = new Date()
		return await this.worktimeRuleModel.findOne({
			where: {
				fromDate: { [Op.lte]: today },
			},
			order: [['fromDate', 'DESC']],
			raw: true
		});
	}

	async findOne(id: number) {
		const rule = await this.worktimeRuleModel.findOne({ where: { id } })
		if (!rule) {
			throw new FlashError('Không tìm thấy luât nào khớp id')
		}
		return rule
	}

	async deleteOne(id: number) {
		const rule = await this.worktimeRuleModel.findOne({ where: { id } })
		if (!rule) {
			throw new FlashError('Không tìm thấy luât nào khớp id')
		}
		await rule.destroy()
	}
}