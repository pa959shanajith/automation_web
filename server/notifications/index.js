const utils = require('../lib/utils');
const generator = require('./generator');
const email = require('./email');
const logger = require('../../logger');
const notfEvents = ["test", "report", "userUpdate", "schedule", "iceAssign", "projectAssign"];
const channels = {};
const preferences = {};

module.exports.initalize = async () => {
	const fnName = "initalizeNotification";
	const inputs = { action: "list", filter: "active" };
	const chList = await utils.fetchData(inputs, "admin/getNotificationChannels", fnName);
	chList.forEach((ch)=> {
		const chType = ch.channel;
		return // remove this
		if (!channels[chType]) {
			if (chType == "email") channels[chType] = new email(ch);
			//else if (chType == "otherChannelType") channels[chType] = otherChannelType;
		}
	});
	for (let ev of notfEvents) {
		preferences[ev] = {
			"email": true,
			"otherChannelType": false
		};
	}
};

module.exports.test = async (channel, conf, data) => {
	if (!notfEvents.includes("test")) {
		logger.error("Unable to send notification for Event: '"+event+"', No such event exists.")
		return {error: { msg: "Notification event "+event+" not found", code: "UNKNOWN_EVENT"}};
	}
	if (channel == "email") {
		const { error, msg, receivers } = await generator.getPayload(channel, "test", data);
		if (error) return error;
		const mailer = new email(conf);
		const res = mailer.send(msg, receivers);
		mailer.destroy();
		return res;
	} else {
		logger.error("Unable to send test notification over "+channel+", Channel is not supported.")
		return {error: { msg: "Notification channel "+channel+" not supported", code: "UNKNOWN_CHANNEL"}};
	}
}

module.exports.notify = async (event, data, channel) => {
	if (!notfEvents.includes(event)) {
		logger.error("Unable to send notification for Event: '"+event+"', No such event exists.")
		return {error: { msg: "Notification event "+event+" not found", code: "UNKNOWN_EVENT"}};
	}
	if (channel && !channels.includes(channel)) {
		logger.error("Unable to send notification over "+channel+", Channel is not supported.")
		return {error: { msg: "Notification channel "+channel+" not supported", code: "UNKNOWN_CHANNEL"}};
	}
	let targetChannels = (channel)? [channel]:Object.keys(channels);
	if (targetChannels.length === 0) {
		logger.error("Unable to send notifications, No Channels are configured/enabled.")
		return {error: { msg: "Notification channel not available", code: "NO_CHANNEL"}};
	}
	targetChannels.forEach(async ch => {
		// Consider preferences i.e. Only send over channels which have enabled notifications event.
		if (!preferences[event][ch]) return false;
		const { error, msg, receivers } = await generator.getPayload(ch, event, data);
		// Check recipient level preferences here.
		if (error) {
			logger.error("Unable to send notification over "+channel+", Errcode"+error.code)
			return error;
		}
		channels[ch].send(msg, receivers);
	});
};

module.exports.update = async () => {
	
};

// UI notifications
module.exports.broadcast = {
	to: [],
	notifyMsg: "",
	isRead: false
};
