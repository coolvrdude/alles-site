import Page from "../components/Page";
import withAuth from "../util/withAuth";
import Link from "next/link";
import axios from "axios";
import {withRouter} from "next/router";
import WideUser from "../components/WideUser";
import {ChevronLeft, ChevronRight} from "react-feather";

const page = props => {
	const backwardsBtn =
		props.users.length > 0 && !props.firstPage ? props.users[0].username : null;
	const forwardsBtn =
		props.users.length > 0 && !props.lastPage
			? props.users[props.users.length - 1].username
			: null;
	return (
		<Page
			user={props.user}
			title="Users"
			breadcrumbs={[
				{
					name: "People"
				}
			]}
		>
			{props.users.length > 0 ? (
				<>
					<NavArrows before={backwardsBtn} after={forwardsBtn} />
					{props.users.map(u => (
						<Link href="/[username]" as={`/${u.username}`} key={u.id}>
							<a>
								<WideUser user={u} />
							</a>
						</Link>
					))}
					<NavArrows before={backwardsBtn} after={forwardsBtn} />
				</>
			) : (
				<div style={{textAlign: "center"}}>
					<h1>Error</h1>
					<p>No users were found.</p>
				</div>
			)}

			<style jsx>{`
				a {
					max-width: 800px;
					margin: 20px auto;
					display: block;
				}
			`}</style>
		</Page>
	);
};

page.getInitialProps = async ctx => {
	const {before, after} = ctx.query;
	const {sessionToken} = ctx.user;

	return (
		await axios.get(
			`${process.env.NEXT_PUBLIC_APIURL}/users${
				after
					? `?after=${encodeURIComponent(after)}`
					: before
					? `?before=${before}`
					: ""
			}`,
			{
				headers: {
					authorization: sessionToken
				}
			}
		)
	).data;
};

export default withRouter(withAuth(page));

//Navigation Arrows
const NavArrows = ({before, after}) => (
	<div>
		{before ? (
			<Link href={`/people?before=${before}`}>
				<a>
					<span>
						<ChevronLeft />
					</span>
				</a>
			</Link>
		) : (
			<a className="disabled">
				<span>
					<ChevronLeft />
				</span>
			</a>
		)}
		{after ? (
			<Link href={`/people?after=${after}`}>
				<a>
					<span>
						<ChevronRight />
					</span>
				</a>
			</Link>
		) : (
			<a className="disabled">
				<span>
					<ChevronRight />
				</span>
			</a>
		)}

		<style jsx>{`
			div {
				display: flex;
				justify-content: center;
			}

			a {
				display: block;
				background: var(--surface);
				width: 30px;
				height: 30px;
				margin: 0 10px;
				display: flex;
				justify-content: center;
				border: solid 1px var(--accents-2);
				border-radius: 50%;
			}

			a.disabled {
				background: none;
				color: var(--accents-4);
			}

			span {
				display: flex;
				flex-flow: column;
				justify-content: center;
			}
		`}</style>
	</div>
);
