import db from "../../../../util/db";
import sessionAuth from "../../../../util/sessionAuth";

export default async (req, res) => {
	const {user} = await sessionAuth(req.headers.authorization);
	if (!user) return res.status(401).json({err: "invalidSession"});

	//Get User
	if (typeof req.query.username !== "string")
		return res.status(400).json({err: "invalidUser"});
	const u = await db.User.findOne({
		where: {
			username: req.query.username
		}
	});
	if (!u) return res.status(400).json({err: "invalidUser"});

	//Response
	res.json({
		id: u.id,
		username: u.username,
		name: u.name,
		nickname: u.nickname,
		about: u.about,
		private: u.private,
		followers: await u.countFollowers(),
		isFollowing: await u.hasFollower(user),
		joinDate: u.createdAt,
		rubies: u.rubies,
		plus: u.plus,
		posts: [
			{
				slug: "abc",
				author: {
					id: u.id,
					name: u.name,
					username: u.username,
					plus: true
				},
				content: "This is another test",
				createdAt: new Date(),
				score: 10,
				vote: 0,
				replies: 1
			},
			{
				slug: "def",
				author: {
					id: u.id,
					name: u.name,
					username: u.username,
					plus: true
				},
				content: "This is a test",
				createdAt: new Date() - 1000,
				score: 15,
				vote: -1,
				replies: 3
			}
		]
	});
};