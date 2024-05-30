export class User {
	constructor(sessionData) {
		Object.assign(this, sessionData);
	}

	isAdmin() {
		return this.permissions.admin;
	}
};
