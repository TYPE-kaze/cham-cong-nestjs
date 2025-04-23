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
		const rule = await this.worktimeRuleModel.findOne({
			where: {
				fromDate: { [Op.lte]: today },
			},
			order: [['fromDate', 'DESC']],
			raw: true
		});
		if (!rule) throw new FlashError('Hiên không có luật nào')
		return rule
	}

	async getRuleOfDate(date: string) {
		const rule = await this.worktimeRuleModel.findOne({
			where: {
				fromDate: { [Op.lte]: date },
			},
			order: [['fromDate', 'DESC']],
		});
		if (!rule) throw new FlashError(`Hiên không có luật cho ngày ${date}`)
		return rule
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

	async isStartLate(time: string) {
		const rule = await this.getCurrentAppliedRule()
		const ruleD = new Date(`1970-01-01T${rule.startTime}Z`)
		ruleD.setMinutes(ruleD.getMinutes() + rule.deltaMins);
		return new Date(`1970-01-01T${time}Z`) > ruleD
	}

	async isLeaveEarly(leaveTime: string, startTime: string) {
		const rule = await this.getCurrentAppliedRule()
		const startTimeD = new Date(`1970-01-01T${startTime}Z`)
		const leaveTimeD = new Date(`1970-01-01T${leaveTime}Z`)
		const ruleStartTimeD = new Date(`1970-01-01T${rule.startTime}Z`)
		const ruleEndTimeD = new Date(`1970-01-01T${rule.endTime}Z`)

		if (startTimeD > ruleStartTimeD) {
			ruleEndTimeD.setMinutes(ruleEndTimeD.getMinutes() + rule.deltaMins);
		}

		return leaveTimeD < ruleEndTimeD
	}
}