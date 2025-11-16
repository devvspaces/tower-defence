export class User {
  constructor(
    public readonly id: string,
    public readonly walletAddress: string,
    public username: string | null,
    public profilePicture: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  updateUsername(username: string): User {
    return new User(
      this.id,
      this.walletAddress,
      username,
      this.profilePicture,
      this.createdAt,
      new Date(),
    );
  }

  updateProfilePicture(profilePicture: string): User {
    return new User(
      this.id,
      this.walletAddress,
      this.username,
      profilePicture,
      this.createdAt,
      new Date(),
    );
  }
}
