export default async function getUserListByOrg(req) {
  const OrganizationId = req.params.organizationId;
  const orgPtr = {
    __type: 'Pointer',
    className: 'contracts_Organizations',
    objectId: OrganizationId,
  };
  if (!req?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  } else {
    try {
      const extUser = new Parse.Query('contracts_Users');
      extUser.equalTo('OrganizationId', orgPtr);
      extUser.include('TeamIds');
      extUser.include('UserId');
      extUser.descending('createdAt');
      const userRes = await extUser.find({ useMasterKey: true });
      if (userRes.length > 0) {
        const _userRes = JSON.parse(JSON.stringify(userRes));
        // Add emailVerified field from UserId to each user
        const usersWithEmailVerified = _userRes.map(user => {
          if (user.UserId && user.UserId.emailVerified !== undefined) {
            return {
              ...user,
              emailVerified: user.UserId.emailVerified
            };
          }
          return user;
        });
        return usersWithEmailVerified;
      } else {
        return [];
      }
    } catch (err) {
      console.log('err in getuserlist', err);
      throw err;
    }
  }
}
