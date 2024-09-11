module.exports = (sequelize, Sequelize) => {
    const Attack = sequelize.define(
        'attacks',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            sourceCountry: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            destinationCountry: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            millisecond: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
            },
            weight: {
                type: Sequelize.STRING,
            },
            attackTime: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        },
        { timestamps: false }
    );

    return Attack;
};
