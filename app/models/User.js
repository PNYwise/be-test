module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        digits: {
            type: Sequelize.STRING(155),
            allowNull: true,
            unique: true,
        },
        fotoUrl: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        workType: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        positionTitle: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        lat: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        lon: {
            type: Sequelize.FLOAT,
            allowNull: true,
        },
        company: {
            type: Sequelize.STRING(155),
            allowNull: true,
        },
        isLogin: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        dovote: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        dosurvey: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        dofeedback: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        fullname: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        cuurentLeave: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        role: {
            type: Sequelize.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'users',
        timestamps: true,
    });

    return User;
};
