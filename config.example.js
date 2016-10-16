module.exports =
{
	botname: 'hermione',
	admin_channel: 'your-admin-channel-id',
	brain: { dbpath: './db' },
	plugins:
	{
		bartly:
		{
			apikey: 'your-bart-api-key',
			station: '19th',
			tzOffset: 420,
		},
	}
};
