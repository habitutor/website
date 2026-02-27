import { admin } from "../../..";
import { adminStatisticsRepo } from "./repo";

const get = admin
	.route({
		path: "/admin/statistics",
		method: "GET",
		tags: ["Admin - Statistics"],
	})
	.handler(async () => {
		return adminStatisticsRepo.getStats({});
	});

export const adminStatisticsRouter = {
	get,
};
