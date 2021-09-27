const types = ['weapons/weapon_', 'hats/hat_', 'body/body_', 'melee/melee_', 'sprays/', 'dyes/', 'waist/waist_', 'faces/face_', 'shoes/shoe_', 'pets/pet_', 'collectibles/collect_'];
const weapons = ['', 'Bolt', 'AK', 'Pistol', 'SMG', 'Rev', 'Shot', 'LMG', 'Semi', 'RL', 'Uzis', 'Deagle', 'AB', 'Sawed Off', 'Cross', 'Famas', 'Auto', 'Bomb', '', 'Blaster', ''];
const { Collection } = require('@discordjs/collection');
const classes = require('./src/classes');

let Skins = require('./src/skins');
const socialData = require('./src/socialHub').store.skins;
Skins = Skins.map((x, i) => {
    const newObj = {};
    for (const [key, value] of Object.entries(x)) {
        if (typeof value == 'number') parseFloat(value);
        newObj[key] = value;
    }
    if (newObj.creator) x.creator = x.creator.replace('\x20', ' ');
    if (newObj.req) delete newObj['req'];
    return {
        ...newObj,
        index: i,
        name: x.name.replace('\x20', ' ').replace('\x27', '\''),
        preview: socialData[i].preview
    };
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

let c = {};
Skins.forEach(x => {
    c[x.name] = (c[x.name] || 0) + 1;
});
const obj = new Collection(Object.entries(c).filter(([, v]) => v > 1));

Skins = Skins.map(skin => {
    const count = obj.get(skin.name);
    if (!count) return skin;
    try {
        if (skin.weapon !== undefined) skin.name = `${skin.name} ${weapons[skin.weapon]}`;
        else skin.name = `${skin.name} ${types[skin.type].split('/')[1].replace('_', '').capitalize()}`;
    } catch {
        console.log(skin);
    }

    return skin;
});
c = {};
Skins.map(x => {
    c[x.name] = (c[x.name] || 0) + 1;
    if (c[x.name] > 1)
        x.name = `${x.name} ${c[x.name]}`;
    return x;
});
module.exports.allSkins = Skins;
module.exports.limited = require('./src/skins').limited;

const sortedRarities = [];
for (let i = 0; i < 7; i++)
    sortedRarities[i] = Skins.filter(x => x.rarity == i);
module.exports.sorted = sortedRarities;

module.exports.getPreview = (t) => {
    if (t.template == 2) {
        t.type = 3;
        t.id = 3;
    }
    return 'https://assets.krunker.io/textures/' + (t.type && t.type == 4 ? 'sprays/' + t.id : 'previews/' + (t.type && (t.type < 3 || t.type > 4) ? 'cosmetics/' + t.type + '_' + t.id + (t.tex ? '_' + t.tex : '') : types[t.type || 0] + (t.type && t.type == 3 ? t.id + (t.pat == null ? t.tex == null ? '' : '_' + t.tex : '_c' + t.pat) : (t.weapon || 0) + '_' + (t.mid == null ? t.pat == null ? t.tex ? t.tex : t.id : 'c' + t.pat : 'm' + t.mid + (t.midT == null ? '' : '_' + t.midT))))) + '.png?build=u9K3c';
};

module.exports.getTexture = (i) => {
    // texSrc:null==t.mid?t.type&&3==t.type?t.pat?t.tex:"melee/melee_"+(t.id||0)+(t.tex?"_"+t.tex:""):t.type?t.tex?d.store.types[t.type||0]+t.id+"_"+t.tex:null:t.tex?t.tex:"weapons/skins/weapon_"+t.weapon+"_"+t.id:s.getReModel(d.store,t)
    let texture = 'https://assets.krunker.io/textures/';

    if (i.weapon) {
        if (i.pat >= 0)
            texture += `weapons/pat/${i.pat}`;
        else if (i.id >= 0)
            texture += `weapons/skins/weapon_${i.weapon}_${i.id}`;
        else if (!i.id >= 0 && i.midT >= 0)
            texture += `${types[0]}${i.weapon}_${i.midT}`;
        else if (!i.id >= 0 && !i.midT && i.mid >= 0)
            texture += `${types[0]}${i.weapon}_${i.mid}`;
    } else if (i.type >= 1 <= 9 && i.type != 5) {
        if (i.pat)
            texture += `weapons/pat/${i.pat}`;
        else if (i.id >= 0 && i.tex)
            texture += `${types[i.type]}${i.id}_${i.tex}`;
        else if (typeof i.id == 'number')
            texture += `${types[i.type]}${i.id}`;
        else if (i.template == 2)
            texture += `${types[3]}3_${i.tex}`;
    }
    const emissive = texture + '_e.png';
    texture += '.png';
    if (i.type == 5)
        texture = 'DYE';

    if (texture == 'https://assets.krunker.io/textures/.png' || texture.indexOf('undefined') > 0) {
        console.log('ERROR SKIN TEXTURE NOT GENERATED', i);
        return 'undefined';
    }
    return { e: emissive, t: texture };
};

const getViewerSuffix = (id) => {
    const skin = Skins[id];
    if (skin) {
        if (skin.type == 1) return 'class=9&hat=' + id;
        else if (skin.type == 2) return 'class=9&back=' + id;
        else if (skin.type == 3) return 'class=9&hidePlayer&melee=' + id;
        else if (skin.type == 5) return 'class=9&dye=' + id;
        else if (skin.type == 6) return 'class=9&waist=' + id;
        else if (skin.type == 7) return 'class=9&face=' + id;
        else if (skin.type == 8) return 'class=9&shoe=' + id;
        else if (skin.type == 9) return 'class=9&pet=' + id;
        else if (skin.weapon != null) {
            if (classes[skin.weapon - 1]['secondary']) return 'hidePlayer&swap=-1&nosup&skinIdS=' + id + '&secIndex=' + (skin['weapon'] - 0x1);
            else {
                let className;
                for (let i = 0; i < classes['length']; i++) {
                    if (classes[i].loadout[0] == skin['weapon'] - 1) {
                        className = i;
                        break;
                    }
                }
                return className != null && 'class=' + className + '&hidePlayer&nosup&skinIdP=' + id;
            }
        }
    }
    throw new Error('Error ID didn\'t work' + id);
};

module.exports.getViewer = (id) => 'https://krunker.io/viewer.html?' + getViewerSuffix(id);
module.exports.textColorParse = (index) => {
    const res = ['Uncommon', 'Rare', 'Epic', 'Legendary', 'Relic', 'Contraband', 'Unobtainable'][index];
    if (res)
        return res;
    else
        return 'Spray';
};

module.exports.colorParse = (color) => { //
    return ['#b2f252', '#2196F3', '#E040FB', '#FBC02D', '#ed4242', '#292929'][color] || '#fff53d';
};

module.exports.getWeaponByID = (id) => {
    // eslint-disable-next-line no-shadow
    const weapons = ['', 'Sniper Rifle', 'Assault Rifle', 'Pistol', 'SMG', 'Revolver', 'Shotgun', 'LMG', 'Semi-Auto', 'Rocket Launcher', 'Akimbo Uzi', 'Deagle', 'Alien Blaster', 'Alien Blaster', 'Crossbow', 'FAMAS', 'Sawed-Off', 'Auto Pistol', 'Bomb', ''];
    return weapons[id] || ' ';
};

module.exports.getModel = (t) => {
    let model = 'https://assets.krunker.io/models/';
    /* if(t.weapon) {
        model += types[t.type||0]+(t.weapon||0)+"_"+(t.midT||t.mid)
    }
    else {
        model+= types[t.type||0]+(t.id||0)+(t.tex ? "_"+(t.tex) : null)
    }*/

    model += types[t.type || 0] + (t.type ? t.id : t.weapon) + (t.mid == null ? '' : '_' + t.mid);

    model += '.obj';
    if (model == 'https://assets.krunker.io/models/.png' || model.indexOf('undefined') > 0) {
        console.log('ERROR SKIN MODEL NOT GENERATED', t);
        return 'undefined';
    }
    return model;
};

module.exports.getMarketLink = (skin) => {
    if (~skin.index)
        return 'https://krunker.io/social.html?p=itemsales&i=' + skin.index;
    else
        return false;
};
