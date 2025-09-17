
const db = require('../models');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class Attendance_eventsDBApi {

    static async create(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const attendance_events = await db.attendance_events.create(
            {
                id: data.id || undefined,

        timestamp: data.timestamp
        ||
        null
            ,

        status: data.status
        ||
        null
            ,

        method: data.method
        ||
        null
            ,

            importHash: data.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
    },
        { transaction },
    );

        return attendance_events;
    }

    static async bulkImport(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        // Prepare data - wrapping individual data transformations in a map() method
        const attendance_eventsData = data.map((item, index) => ({
                id: item.id || undefined,

                timestamp: item.timestamp
            ||
            null
            ,

                status: item.status
            ||
            null
            ,

                method: item.method
            ||
            null
            ,

            importHash: item.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
            createdAt: new Date(Date.now() + index * 1000),
    }));

        // Bulk create items
        const attendance_events = await db.attendance_events.bulkCreate(attendance_eventsData, { transaction });

        return attendance_events;
    }

    static async update(id, data, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const attendance_events = await db.attendance_events.findByPk(id, {}, {transaction});

        const updatePayload = {};

        if (data.timestamp !== undefined) updatePayload.timestamp = data.timestamp;

        if (data.status !== undefined) updatePayload.status = data.status;

        if (data.method !== undefined) updatePayload.method = data.method;

        updatePayload.updatedById = currentUser.id;

        await attendance_events.update(updatePayload, {transaction});

        return attendance_events;
    }

    static async deleteByIds(ids, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const attendance_events = await db.attendance_events.findAll({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
            transaction,
        });

        await db.sequelize.transaction(async (transaction) => {
            for (const record of attendance_events) {
                await record.update(
                    {deletedBy: currentUser.id},
                    {transaction}
                );
            }
            for (const record of attendance_events) {
                await record.destroy({transaction});
            }
        });

        return attendance_events;
    }

    static async remove(id, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const attendance_events = await db.attendance_events.findByPk(id, options);

        await attendance_events.update({
            deletedBy: currentUser.id
        }, {
            transaction,
        });

        await attendance_events.destroy({
            transaction
        });

        return attendance_events;
    }

    static async findBy(where, options) {
        const transaction = (options && options.transaction) || undefined;

        const attendance_events = await db.attendance_events.findOne(
            { where },
            { transaction },
        );

        if (!attendance_events) {
            return attendance_events;
        }

        const output = attendance_events.get({plain: true});

        return output;
    }

    static async findAll(filter, options) {
        const limit = filter.limit || 0;
        let offset = 0;
        let where = {};
        const currentPage = +filter.page;

        const user = (options && options.currentUser) || null;

        offset = currentPage * limit;

        const orderBy = null;

        const transaction = (options && options.transaction) || undefined;

        let include = [];

        if (filter) {
            if (filter.id) {
                where = {
                    ...where,
                    ['id']: Utils.uuid(filter.id),
                };
            }

            if (filter.timestampRange) {
                const [start, end] = filter.timestampRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    timestamp: {
                    ...where.timestamp,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    timestamp: {
                    ...where.timestamp,
                            [Op.lte]: end,
                    },
                };
                }
            }

            if (filter.active !== undefined) {
                where = {
                    ...where,
                    active: filter.active === true || filter.active === 'true'
                };
            }

            if (filter.status) {
                where = {
                    ...where,
                status: filter.status,
            };
            }

            if (filter.method) {
                where = {
                    ...where,
                method: filter.method,
            };
            }

            if (filter.createdAtRange) {
                const [start, end] = filter.createdAtRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                        ['createdAt']: {
                            ...where.createdAt,
                            [Op.gte]: start,
                        },
                    };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                        ['createdAt']: {
                            ...where.createdAt,
                            [Op.lte]: end,
                        },
                    };
                }
            }
        }

        const queryOptions = {
            where,
            include,
            distinct: true,
            order: filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction: options?.transaction,
            logging: console.log
        };

        if (!options?.countOnly) {
            queryOptions.limit = limit ? Number(limit) : undefined;
            queryOptions.offset = offset ? Number(offset) : undefined;
        }

        try {
            const { rows, count } = await db.attendance_events.findAndCountAll(queryOptions);

            return {
                rows: options?.countOnly ? [] : rows,
                count: count
            };
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    static async findAllAutocomplete(query, limit, offset) {
        let where = {};

        if (query) {
            where = {
                [Op.or]: [
                    { ['id']: Utils.uuid(query) },
                    Utils.ilike(
                        'attendance_events',
                        'timestamp',
                        query,
                    ),
                ],
            };
        }

        const records = await db.attendance_events.findAll({
            attributes: [ 'id', 'timestamp' ],
            where,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            orderBy: [['timestamp', 'ASC']],
        });

        return records.map((record) => ({
            id: record.id,
            label: record.timestamp,
        }));
    }

};

