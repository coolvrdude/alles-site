import Page from "../components/ColumnPage";
import {useState, useEffect} from "react";
import {withRouter} from "next/router";
import withAuth from "../util/withAuth";
import Cookies from "js-cookie";
import config from "../config";
import axios from "axios";
import {Input, Button, Box, Spacer} from "@reactants/ui";

export default withAuth(
	withRouter(props => {
		if (props.user) {
			return (
				<Page title="Sign in" user={props.user}>
					<h2>Hang on a minute!</h2>
					<p>You're already signed in!</p>

					<Spacer y={2} />

					<Button
						fluid
						primary
						onClick={() => {
							const redirectUrl = props.router.query.redirect;
							window.location.href = redirectUrl ? redirectUrl : "/";
						}}
					>
						{props.router.query.redirect
							? "Continue to Redirect"
							: "Return to Homepage"}
					</Button>
					<Spacer y={0.5} />
					<Button fluid secondary>
						Switch Accounts
					</Button>

					<style jsx>{`
						h2,
						p {
							text-align: center;
						}
					`}</style>
				</Page>
			);
		} else {
			// Not Signed in
			const [error, setError] = useState();
			const [loading, setLoading] = useState(false);
			const [pulsar, setPulsar] = useState(null);

			// Complete Sign in
			const completeSignIn = token => {
				Cookies.set("sessionToken", token, {
					domain: location.host === config.domain ? config.domain : null,
					expires: 365
				});
				const redirectUrl = props.router.query.redirect;
				window.location.href = redirectUrl ? redirectUrl : "/";
			};

			// Pulsar
			useEffect(() => {
				axios
					.get("http://localhost:2318/token")
					.then(() => {
						setPulsar(true);
					})
					.catch(() => {
						setPulsar(false);
					});
			}, []);

			return (
				<Page title="Sign in">
					<h2 style={{textAlign: "center"}}>Sign In</h2>

					<Box>
						<Box.Header>Enter your credentials</Box.Header>
						<Box.Content
							as="form"
							onSubmit={e => {
								e.preventDefault();
								setError();
								const username = e.target.username.value.trim().toLowerCase();
								const password = e.target.password.value;
								if (!username || !password) return;

								// Request
								setLoading(true);
								axios
									.post(`${config.apiUrl}/login`, {
										username,
										password
									})
									.then(res => {
										completeSignIn(res.data.token);
									})
									.catch(err => {
										if (err.response.data.err === "credentialsIncorrect") {
											setError(
												"Your username or password doesn't seem to be right :/"
											);
										} else {
											setError(
												"Uh oh. Something's gone wrong. Maybe try again?"
											);
										}
										setLoading(false);
									});
							}}
							padding="20px 25px"
						>
							<Input
								label="Username"
								name="username"
								placeholder="jessica"
								fluid
								onChange={() => setError(false)}
							/>

							<Spacer y={0.5} />

							<Input.Password
								label="Password"
								name="password"
								placeholder="•••••••••••"
								fluid
								onChange={() => setError(false)}
							/>

							<Spacer y={1} />

							<Button loading={loading} fluid primary>
								Sign In
							</Button>

							<Spacer y={0.5} />

							{error ? <p className="error">{error}</p> : <></>}
						</Box.Content>
					</Box>

					<Spacer y={2} />

					<Box>
						<Box.Header>Sign in another way</Box.Header>
						<Box.Content>
							<Button
								fluid
								loading={pulsar === null}
								disabled={!pulsar}
								onClick={() => {
									setError();
									setPulsar(null);
									axios
										.get("http://localhost:2318/token")
										.then(res => {
											axios
												.post(`${config.apiUrl}/login`, {
													pulsarToken: res.data
												})
												.then(res => {
													completeSignIn(res.data.token);
												})
												.catch(() => {
													setPulsar(false);
													setError(
														"Signing in with Pulsar isn't working right now."
													);
												});
										})
										.catch(() => {
											setPulsar(false);
											setError(
												"Signing in with Pulsar isn't working right now."
											);
										});
								}}
							>
								Sign in with Pulsar
							</Button>
						</Box.Content>
					</Box>

					<style jsx>{`
						h2 {
							text-align: center;
						}

						.error {
							color: var(--danger);
							margin: 0;
						}
					`}</style>
				</Page>
			);
		}
	}),
	true
);
