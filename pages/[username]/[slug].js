import Page from "../../components/Page";
import withAuth from "../../util/withAuth";
import axios from "axios";
import Router, {withRouter} from "next/router";
import {Spacer} from "@reactants/ui";
import Post from "../../components/Post";
import PostField from "../../components/PostField";
import NotFound from "../404";
import Hr from "../../components/Hr";

const page = props => {
	if (props.post) {
		return (
			<Page
				title={`@${props.post.author.username}`}
				user={props.user}
				breadcrumbs={[
					{
						name: `@${props.post.author.username}`,
						href: "/[username]",
						as: `/${props.post.author.username}`
					}
				]}
			>
				{props.post.ancestors.map(p => (
					<React.Fragment key={p.slug}>
						<Post
							data={p}
							self={p.author && props.user.id === p.author.id}
							sessionToken={props.user.sessionToken}
						/>
						<div className="chain"></div>
					</React.Fragment>
				))}

				<React.Fragment key={props.post.slug}>
					<Post
						data={props.post}
						self={props.user.id === props.post.author.id}
						sessionToken={props.user.sessionToken}
						expanded
					/>

					<div className="chain"></div>

					<PostField
						placeholder={
							props.user.id !== props.post.author.id
								? `Reply to @${props.post.author.username}`
								: "Got something else to say?"
						}
						button="Reply"
						parent={props.post.slug}
						sessionToken={props.user.sessionToken}
					/>
				</React.Fragment>

				<Spacer y={2} />

				{props.post.replies.length > 0 ? (
					<>
						<Hr margin="0" />
						<div className="replies">
							{props.post.replies.map(p => (
								<React.Fragment key={p.slug}>
									<Spacer y={2} />
									<Post
										data={p}
										self={props.user.id === p.author.id}
										sessionToken={props.user.sessionToken}
									/>
								</React.Fragment>
							))}
						</div>
					</>
				) : (
					<></>
				)}

				<style jsx>{`
					.chain {
						background: var(--accents-2);
						width: 10px;
						height: 50px;
						margin: 0 auto;
					}

					.replies {
						padding: 0 20px;
					}
				`}</style>
			</Page>
		);
	} else {
		// Not Found
		return <NotFound />;
	}
};

page.getInitialProps = async ctx => {
	const {username, slug} = ctx.query;
	const {sessionToken} = ctx.user;

	try {
		const post = (
			await axios.get(
				`${process.env.NEXT_PUBLIC_APIURL}/post/${encodeURIComponent(
					slug
				)}?children`,
				{
					headers: {
						authorization: sessionToken
					}
				}
			)
		).data;

		if (post.author.username !== username) {
			// Redirect to correct username
			const redirectUrl = `/${post.author.username}/${post.slug}`;
			if (typeof window === "undefined") {
				ctx.res.writeHead(302, {Location: redirectUrl});
				ctx.res.end();
			} else {
				Router.push("/[username]/[slug]", redirectUrl);
			}
		}

		return {
			post
		};
	} catch (err) {
		if (ctx.res) ctx.res.statusCode = 404;
	}
};

export default withAuth(withRouter(page));
