import Page from "../layout/Page";
import withAuth from "../util/withAuth";
import theme from "../theme";
import config from "../config";
import {useState, createRef} from "react";
import axios from "axios";
import formatAu from "../util/formatAu";
import Input from "../components/Input";
import Button from "../components/Button";
import WideLink from "../components/WideLink";
import Link from "next/link";

const homepage = props => {
	const [loading, setLoading] = useState(false);
	const [banner, setBanner] = useState({});
	const avatarUploadInput = createRef();

	//Show Banner
	const showBanner = message => {
		setBanner({
			message,
			update: Math.random()
		});
	};

	//Upload Avatar
	const avatarUpload = e => {
		setLoading(true);
		const file = e.target.files[0];
		const formData = new FormData();
		formData.append("avatar", file);
		e.target.value = null;
		axios
			.post(`${config.apiUrl}/avatar`, formData, {
				headers: {
					authorization: props.user.sessionToken
				}
			})
			.then(() => {
				showBanner("Avatar updated successfully.");
				setLoading(false);
			})
			.catch(error => {
				if (error.response) {
					const {err} = error.response.data;
					if (err === "avatarTooBig" || error.response.status === 413) {
						showBanner("The avatar you selected is too big.");
					} else if (err === "badFileType") {
						showBanner("Your avatar must be a png file.");
					} else {
						showBanner("Something went wrong.");
					}
				} else {
					showBanner("Something went wrong.");
				}
				setLoading(false);
			});
	};

	//Update Profile
	const updateProfile = e => {
		e.preventDefault();
		const form = e.target;
		const fullname = form.name.value.trim();
		const nickname = form.nickname.value.trim();
		const about = form.about.value.trim();
		if (loading || !fullname || !nickname || !about) return;
		setLoading(true);

		axios
			.post(
				`${config.apiUrl}/me`,
				{
					name: fullname,
					nickname,
					about
				},
				{
					headers: {
						authorization: props.user.sessionToken
					}
				}
			)
			.then(() => {
				showBanner("Profile updated.");
				setLoading(false);
			})
			.catch(() => {
				showBanner("Something went wrong.");
				setLoading(false);
			});
	};

	//Change Password
	const changePassword = e => {
		e.preventDefault();
		const form = e.target;
		const oldPassword = form.oldPassword.value;
		const newPassword = form.newPassword.value;
		const newPassword2 = form.newPassword2.value;
		if (loading || !oldPassword || !newPassword || !newPassword2) return;
		setLoading(true);

		if (newPassword === newPassword2) {
			axios
				.post(
					`${config.apiUrl}/password`,
					{
						oldPassword,
						newPassword
					},
					{
						headers: {
							authorization: props.user.sessionToken
						}
					}
				)
				.then(() => {
					showBanner("Password successfully updated.");
					setLoading(false);
					form.reset();
				})
				.catch(error => {
					if (error.response) {
						const {err} = error.response.data;
						if (err === "passwordRequirements") {
							showBanner(
								"Passwords must be between 6 and 128 characters long."
							);
						} else if (err === "oldPasswordIncorrect") {
							showBanner("The old password you entered is incorrect.");
						} else if (err === "badPassword") {
							showBanner("You can't change your password to this.");
						} else {
							showBanner("Something went wrong.");
						}
					} else {
						showBanner("Something went wrong.");
					}
					setLoading(false);
				});
		} else {
			setLoading(false);
			showBanner("New passwords do not match");
		}
	};

	//Au Balance
	const auBalance = props.auAccounts.length > 0 ? props.auAccounts[0].balance : null;
	const auDisplay = auBalance !== null ? formatAu(auBalance) : null;

	return (
		<Page title="My Account" header banner={banner} user={props.user}>
			<section className="user">
				<div
					className="profilePicture"
					onClick={() => avatarUploadInput.current.click()}
				>
					<img className="overlay" src="/add-overlay.png" />
					<img
						className="picture"
						src={`https://avatar.alles.cx/user/${props.user.id}`}
					/>
				</div>
				<h1 className="name">
					{props.user.name}
					{props.user.plus ? <sup>+</sup> : <></>}
				</h1>
				<h2 className="username">@{props.user.username}</h2>

				<input
					type="file"
					ref={avatarUploadInput}
					style={{display: "none"}}
					accept="image/png"
					onChange={avatarUpload}
					disabled={loading}
				/>

				<div className="quickInfo">
					<Link href="/au">
						<a>
							<div>
								<i className="fas fa-coins"></i>
								{props.auAccounts.length > 0 ? (
									<p>
										<b>{auDisplay}</b> Au
									</p>
								) : (
									<p>No Au</p>
								)}
							</div>
						</a>
					</Link>

					<Link href="/plus">
						<a>
							<div>
								<i className="fas fa-bolt"></i>
								<p>
									{props.user.plus ? (
										<>
											Alles+ is <b>Active</b>
										</>
									) : (
										<>
											Try <b>Alles+</b>
										</>
									)}
								</p>
							</div>
						</a>
					</Link>

					<Link href="/rubies">
						<a>
							<div>
								<i className="fas fa-gem"></i>
								<p>
									<b>{props.user.rubies}</b>{" "}
									{props.user.rubies === 1 ? "Ruby" : "Rubies"}
								</p>
							</div>
						</a>
					</Link>
				</div>
			</section>

			<section>
				<h1 className="sectionTitle">Basic Settings</h1>
				<div className="box">
					<h1>Your Profile</h1>
					<form onSubmit={updateProfile}>
						<h2>Your Name</h2>
						<Input
							wide
							name="name"
							maxLength="50"
							placeholder="Jessica Adams"
							defaultValue={props.user.name}
						/>
						<h2>Nickname</h2>
						<Input
							wide
							name="nickname"
							maxLength="50"
							placeholder="Jessica"
							defaultValue={props.user.nickname}
						/>
						<h2>About</h2>
						<Input
							wide
							name="about"
							maxLength="125"
							placeholder="Hi, I'm Jessica! I'm 29 and work in the music industry, specifically modern classical music!"
							defaultValue={props.user.about}
						/>
						<Button wide disabled={loading}>
							Update
						</Button>
					</form>
				</div>
			</section>

			<section>
				<h1 className="sectionTitle">Apps</h1>
				<WideLink href="/pulsar">Pulsar Clients</WideLink>
				<WideLink href="/oauth">Authorized OAuth Applications</WideLink>
				<WideLink href="https://dev.alles.cx" basic>
					Create an Application
				</WideLink>
			</section>

			<section>
				<h1 className="sectionTitle">Security</h1>
				<div className="box">
					<h1>Change your Password</h1>
					<form onSubmit={changePassword}>
						<h2>Old Password</h2>
						<Input wide type="password" name="oldPassword" />
						<h2>New Password</h2>
						<Input wide type="password" name="newPassword" />
						<h2>Confirm New Password</h2>
						<Input wide type="password" name="newPassword2" />
						<Button wide disabled={loading}>
							Update Password
						</Button>
					</form>
				</div>
			</section>

			<style jsx>{`
				section {
					background: white;
					max-width: 600px;
					margin: 20px auto;
					border-radius: 10px;
					padding: 20px;
					box-sizing: border-box;
				}

				h1.sectionTitle {
					border-left: solid 5px;
					padding-left: 10px;
					padding-right: 5px;
					transition: 0.1s;
				}

				section:hover h1.sectionTitle {
					border-color: ${theme.accent};
					padding-left: 15px;
					padding-right: 0px;
				}

				section.user {
					margin-top: 100px;
					padding-top: 0;
					text-align: center;
				}

				.profilePicture {
					border: solid 10px ${theme.greyF};
					border-radius: 50%;
					height: 200px;
					width: 200px;
					position: relative;
					top: -100px;
					margin: 0 auto;
					margin-bottom: -100px;
					box-sizing: border-box;
					background: white;
					cursor: pointer;
					overflow: hidden;
				}

				.profilePicture img {
					position: absolute;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					transition: 0.1s;
				}

				.profilePicture:hover img.picture {
					filter: blur(1px);
				}

				.profilePicture img.overlay {
					z-index: 1;
					opacity: 0;
				}

				.profilePicture:hover img.overlay {
					opacity: 1;
				}

				h1.name {
					font-size: 30px;
					margin: 0;
					margin-top: 10px;
					font-weight: 500;
				}

				h2.username {
					font-size: 15px;
					font-weight: 400;
					margin: 0;
					margin-bottom: 10px;
					color: ${theme.accent};
				}

				.quickInfo {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
				}

				.quickInfo div {
					width: 170px;
					padding: 10px;
					box-sizing: border-box;
					cursor: pointer;
					border-radius: 10px;
				}

				.quickInfo div:hover {
					background: #f0f0f080;
				}

				.quickInfo div i {
					font-size: 20px;
					margin-bottom: 10px;
				}

				.quickInfo div p {
					margin: 0;
					color: ${theme.grey4};
				}

				.quickInfo div b {
					color: black;
				}

				.box {
					border: solid 1px ${theme.borderGrey};
					border-radius: 10px;
					padding: 20px;
				}

				.box h1 {
					font-weight: 500;
					margin: 0;
					margin-bottom: 40px;
					font-size: 20px;
				}

				.box h2 {
					font-weight: 500;
					color: ${theme.grey4};
					margin: 0;
					margin-top: 20px;
					font-size: 18px;
				}

				@media screen and (max-width: 700px) {
					.quickInfo {
						display: block;
					}

					.quickInfo div {
						width: 100%;
					}
				}

				@media screen and (max-width: 450px) {
					.profilePicture {
						height: 120px;
						width: 120px;
						top: -60px;
						margin-bottom: -80px;
					}
				}
			`}</style>
		</Page>
	);
};

homepage.getInitialProps = async ctx => {
	return {
		auAccounts: (
			await axios.get(`${config.apiUrl}/au/accounts`, {
				headers: {
					authorization: ctx.user.sessionToken
				}
			})
		).data.accounts
			.map(acc => (acc.team ? null : acc))
			.filter(Boolean)
	};
};

export default withAuth(homepage);
