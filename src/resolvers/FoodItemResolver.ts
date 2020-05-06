import { Resolver, Arg, Query, Ctx, FieldResolver, Float } from "type-graphql";
import { FoodItem } from "../entities/FoodItem";
import { Context } from "../config/context";

@Resolver((_of) => FoodItem)
export default class FoodItemResolver {
	@Query((_returns) => [FoodItem], { nullable: false })
	async foodGroup(
		@Arg("input") groupId: string,
		@Ctx() { dataSources }: Context
	) {
		const items = await dataSources.bedcaAPI.getFoodGroup(groupId);
		return items;
	}

	@FieldResolver((_type) => Float)
	quantity() {
		return Math.random() * 10;
	}

	@FieldResolver((_type) => String)
	unit() {
		return "g";
	}
}
