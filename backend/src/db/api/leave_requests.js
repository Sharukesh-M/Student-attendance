
const db = require('../models');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class Leave_requestsDBApi {

    static async create(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const leave_requests = await db.leave_requests.create(
            {
                id: data.id || undefined,

        date: data.date
        ||
        null
            ,

        reason: data.reason
        ||
        null
            ,

        status: data.status
        ||
        null
            ,

            importHash: data.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
    },
        { transaction },
    );

        return leave_requests;
    }

    static async bulkImport(data, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        // Prepare data - wrapping individual data transformations in a map() method
        const leave_requestsData = data.map((item, index) => ({
                id: item.id || undefined,

                date: item.date
            ||
            null
            ,

                reason: item.reason
            ||
            null
            ,

                status: item.status
            ||
            null
            ,

            importHash: item.importHash || null,
            createdById: currentUser.id,
            updatedById: currentUser.id,
            createdAt: new Date(Date.now() + index * 1000),
    }));

        // Bulk create items
        const leave_requests = await db.leave_requests.bulkCreate(leave_requestsData, { transaction });

        return leave_requests;
    }

    static async update(id, data, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const leave_requests = await db.leave_requests.findByPk(id, {}, {transaction});

        const updatePayload = {};

        if (data.date !== undefined) updatePayload.date = data.date;

        if (data.reason !== undefined) updatePayload.reason = data.reason;

        if (data.status !== undefined) updatePayload.status = data.status;

        updatePayload.updatedById = currentUser.id;

        await leave_requests.update(updatePayload, {transaction});

        return leave_requests;
    }

    static async deleteByIds(ids, options) {
        const currentUser = (options && options.currentUser) || { id: null };
        const transaction = (options && options.transaction) || undefined;

        const leave_requests = await db.leave_requests.findAll({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
            transaction,
        });

        await db.sequelize.transaction(async (transaction) => {
            for (const record of leave_requests) {
                await record.update(
                    {deletedBy: currentUser.id},
                    {transaction}
                );
            }
            for (const record of leave_requests) {
                await record.destroy({transaction});
            }
        });

        return leave_requests;
    }

    static async remove(id, options) {
        const currentUser = (options && options.currentUser) || {id: null};
        const transaction = (options && options.transaction) || undefined;

        const leave_requests = await db.leave_requests.findByPk(id, options);

        await leave_requests.update({
            deletedBy: currentUser.id
        }, {
            transaction,
        });

        await leave_requests.destroy({
            transaction
        });

        return leave_requests;
    }

    static async findBy(where, options) {
        const transaction = (options && options.transaction) || undefined;

        const leave_requests = await db.leave_requests.findOne(
            { where },
            { transaction },
        );

        if (!leave_requests) {
            return leave_requests;
        }

        const output = leave_requests.get({plain: true});

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

                if (filter.reason) {
                    where = {
                        ...where,
                        [Op.and]: Utils.ilike(
                            'leave_requests',
                            'reason',
                            filter.reason,
                        ),
                    };
                }

            if (filter.dateRange) {
                const [start, end] = filter.dateRange;

                if (start !== undefined && start !== null && start !== '') {
                    where = {
                        ...where,
                    date: {
                    ...where.date,
                            [Op.gte]: start,
                    },
                };
                }

                if (end !== undefined && end !== null && end !== '') {
                    where = {
                        ...where,
                    date: {
                    ...where.date,
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
            const { rows, count } = await db.leave_requests.findAndCountAll(queryOptions);

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
                        'leave_requests',
                        'reason',
                        query,
                    ),
                ],
            };
        }

        const records = await db.leave_requests.findAll({
            attributes: [ 'id', 'reason' ],
            where,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            orderBy: [['reason', 'ASC']],
        });

        return records.map((record) => ({
            id: record.id,
            label: record.reason,
        }));
    }

};

