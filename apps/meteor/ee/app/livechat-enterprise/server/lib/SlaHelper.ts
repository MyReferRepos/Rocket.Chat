import type { IMessage, IOmnichannelServiceLevelAgreements, IUser } from '@rocket.chat/core-typings';
import { LivechatInquiry, LivechatRooms, Messages } from '@rocket.chat/models';

export const removeSLAFromRooms = async (slaId: string) => {
	const openRooms = await LivechatRooms.findOpenBySlaId(slaId, { projection: { _id: 1 } }).toArray();
	if (openRooms.length) {
		const openRoomIds: string[] = openRooms.map(({ _id }) => _id);
		await LivechatInquiry.bulkUnsetSla(openRoomIds);
	}

	await LivechatRooms.bulkRemoveSlaFromRoomsById(slaId);
};

export const updateInquiryQueueSla = async (roomId: string, sla: Pick<IOmnichannelServiceLevelAgreements, 'dueTimeInMinutes' | '_id'>) => {
	const inquiry = await LivechatInquiry.findOneByRoomId(roomId, { projection: { rid: 1, ts: 1 } });
	if (!inquiry) {
		return;
	}

	const { dueTimeInMinutes, _id: slaId } = sla;

	const estimatedWaitingTimeQueue = dueTimeInMinutes;

	await LivechatInquiry.setSlaForRoom(inquiry.rid, {
		slaId,
		estimatedWaitingTimeQueue,
	});
};

export const updateRoomSlaWeights = async (roomId: string, sla: Pick<IOmnichannelServiceLevelAgreements, 'dueTimeInMinutes' | '_id'>) => {
	await LivechatRooms.setSlaForRoomById(roomId, sla);
};

export const removeInquiryQueueSla = async (roomId: string) => {
	await LivechatInquiry.unsetSlaForRoom(roomId);
};

export const removeSlaFromRoom = async (roomId: string) => {
	await LivechatRooms.removeSlaFromRoomById(roomId);
};

export const addSlaChangeHistoryToRoom = async (
	roomId: string,
	user: Pick<IUser, '_id' | 'name' | 'username'>,
	sla?: Pick<IOmnichannelServiceLevelAgreements, 'name'>,
) => {
	await Messages.createSLAHistoryWithRoomIdMessageAndUser(roomId, user as IMessage['u'], sla);
};