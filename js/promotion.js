var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgltvyDH_CcikA1_V54LNm1gEmaho_mtrDAaqnukfC3Ou6M3O05nbYzSHtvPG-G_P8/exec",
    vipMembers = [],
    aiArtists = [],
    currentLang = "es";

function loadVipMembers(e) {
    var n = `${SCRIPT_URL}?action=get_vip_members&lang=${e}&t=${Date.now()}`;
    fetch(n).then((e => {
        if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
        return e.text()
    })).then((n => {
        try {
            var t = JSON.parse(n);
            vipMembers = Array.isArray(t) ? t : [], renderVipMembers(e)
        } catch (n) {
            vipMembers = [], renderVipMembers(e)
        }
    })).catch((n => {
        vipMembers = [], renderVipMembers(e)
    }))
}

function renderVipMembers(e) {
    var n = {
            es: {
                member: "Miembro VIP",
                level: "Nivel",
                joined: "Se unió",
                noMembers: "No hay miembros VIP disponibles"
            },
            en: {
                member: "VIP Member",
                level: "Level",
                joined: "Joined",
                noMembers: "No VIP members available"
            },
            ja: {
                member: "VIPメンバー",
                level: "レベル",
                joined: "参加日",
                noMembers: "VIPメンバーは利用できません"
            },
            zh: {
                member: "VIP会员",
                level: "等级",
                joined: "加入日期",
                noMembers: "暂无VIP会员"
            },
            zh_tw: {
                member: "VIP會員",
                level: "等級",
                joined: "加入日期",
                noMembers: "暫無VIP會員"
            }
        },
        t = n[e] || n.es,
        i = document.querySelectorAll(".vip-container");
    0 !== i.length && i.forEach((function(n) {
        var i = n.closest(".vip-content");
        if ((i ? i.getAttribute("data-lang") : e) === e) {
            if (n.innerHTML = "", 0 === vipMembers.length) return void(n.innerHTML = `<div style="text-align: center; color: #a0aec0; padding: 20px;">${t.noMembers}</div>`);
            vipMembers.forEach((function(i) {
                n.innerHTML += createVipCard(i, t, e)
            }))
        } else n.innerHTML = ""
    }))
}

function loadArtists(e) {
    var n = `${SCRIPT_URL}?action=get_artists&lang=${e}&t=${Date.now()}`;
    fetch(n).then((e => {
        if (!e.ok) throw new Error(`HTTP error! status: ${e.status}`);
        return e.text()
    })).then((n => {
        try {
            var t = JSON.parse(n);
            aiArtists = Array.isArray(t) ? t : [], renderArtists(e)
        } catch (n) {
            aiArtists = [], renderArtists(e)
        }
    })).catch((n => {
        aiArtists = [], renderArtists(e)
    }))
}

function renderArtists(e) {
    var n = {
            es: {
                viewProfile: "Ver Perfil",
                noArtists: "No hay artistas disponibles"
            },
            en: {
                viewProfile: "View Profile",
                noArtists: "No artists available"
            },
            ja: {
                viewProfile: "プロフィールを見る",
                noArtists: "アーティストは利用できません"
            },
            zh: {
                viewProfile: "查看资料",
                noArtists: "暂无艺术家"
            },
            zh_tw: {
                viewProfile: "查看個人資料",
                noArtists: "暫無藝術家"
            }
        },
        t = n[e] || n.es,
        i = document.querySelectorAll(".ai-artists-container");
    0 !== i.length && i.forEach((function(n) {
        var i = n.closest(".artists-content");
        if ((i ? i.getAttribute("data-lang") : e) === e) {
            if (n.innerHTML = "", 0 === aiArtists.length) return void(n.innerHTML = `<div style="text-align: center; color: #a0aec0; padding: 20px;">${t.noArtists}</div>`);
            aiArtists.forEach((function(i) {
                n.innerHTML += createArtistCard(i, t.viewProfile, e)
            }))
        } else n.innerHTML = ""
    }))
}

function createVipCard(member, t, lang) {
    var colors = member.gradientStart && member.gradientEnd ? 
        [member.gradientStart, member.gradientEnd] : 
        generateColorsFromUsername(member.username);
    
    var formattedDate = formatDate(member.joinDate, lang);
    
    return `
        <div class="vip-card" style="
            background: linear-gradient(135deg, #1a1a2e 0%, #0f1419 100%);
            border-radius: 16px;
            padding: 20px;
            border: 2px solid rgba(255, 215, 0, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
            margin-bottom: 20px;
            max-width: 100%;
            box-sizing: border-box;
        ">
            <div class="vip-card-content" style="
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
                position: relative;
                z-index: 1;
                flex-wrap: wrap;
            ">
                <div class="vip-badge" style="
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${member.badgeColor || `linear-gradient(45deg, ${colors[0]} 0%, ${colors[1]} 100%)`};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
                    flex-shrink: 0;
                    position: relative;
                    min-width: 60px;
                ">
                    <svg style="width: 28px; height: 28px; fill: white;" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                </div>
                
                <div class="vip-info" style="flex: 1; min-width: 0; max-width: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                        <h3 class="vip-username" style="
                            margin: 0;
                            color: #FFD700;
                            font-size: 1.3rem;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            font-weight: bold;
                            text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                            max-width: 100%;
                        ">
                            @${member.username || 'Usuario'}
                        </h3>
                        <span class="vip-status" style="
                            background: linear-gradient(45deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
                            background-size: 200% 200%;
                            animation: goldenShine 2s linear infinite;
                            color: #000;
                            font-size: 0.7rem;
                            font-weight: bold;
                            padding: 3px 8px;
                            border-radius: 12px;
                            letter-spacing: 0.5px;
                            white-space: nowrap;
                        ">
                            ${t.member}
                        </span>
                    </div>
                    
                    <div class="vip-details" style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap;">
                        <svg style="width: 14px; height: 14px; fill: #FFD700; flex-shrink: 0;" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span style="color: #a0aec0; font-size: 0.85rem; word-break: break-word;">
                            <span style="color: #FFD700; font-weight: bold;">${t.level}:</span> 
                            <span style="color: #fff; font-weight: 500;">${member.level || 'Standard'}</span>
                        </span>
                    </div>
                    
                    <div class="vip-details" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <svg style="width: 14px; height: 14px; fill: #FFD700; flex-shrink: 0;" viewBox="0 0 24 24">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                        </svg>
                        <span style="color: #a0aec0; font-size: 0.85rem; word-break: break-word;">
                            <span style="color: #FFD700;">${t.joined}:</span> ${formattedDate}
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 15px; position: relative; z-index: 1; width: 100%;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; flex-wrap: wrap;">
                    <span style="color: #FFD700; font-size: 0.8rem; font-weight: bold;">VIP Status</span>
                    <span style="color: #a0aec0; font-size: 0.8rem;">${member.progress || 0}%</span>
                </div>
                <div style="
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                ">
                    <div style="
                        width: ${member.progress || 0}%;
                        height: 100%;
                        background: linear-gradient(90deg, ${colors[0]}, ${colors[1]});
                        border-radius: 3px;
                        animation: goldGlow 2s ease-in-out infinite;
                    "></div>
                </div>
            </div>
        </div>
    `;
}

function createArtistCard(artist, buttonText, lang) {
    var colors = artist.gradientStart && artist.gradientEnd ?
        [artist.gradientStart, artist.gradientEnd] :
        generateArtistColors(artist.username);

    var platformIcon = getPlatformSVGIcon(artist.icon || 'x');
    var initials = getInitials(artist.displayName || artist.username || '');

    return `
        <div class="artist-card" style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
            max-width: 100%;
            box-sizing: border-box;
        ">
            <div style="
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 30%,
                    rgba(66, 153, 225, 0.1) 50%,
                    transparent 70%
                );
                animation: goldenShine 4s linear infinite;
                pointer-events: none;
            "></div>
            
            <div class="artist-card-content" style="display: flex; align-items: center; gap: 16px; margin-bottom: 15px; position: relative; z-index: 1; flex-wrap: wrap;">
                <div class="artist-avatar" style="
                    width: 70px;
                    height: 70px;
                    min-width: 70px;
                    border-radius: 50%;
                    background: linear-gradient(45deg, ${colors[0]} 0%, ${colors[1]} 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    flex-shrink: 0;
                    position: relative;
                ">
                    ${artist.profileImage && artist.profileImage !== 'https://example.com/image1.jpg' &&
        artist.profileImage !== 'https://example.com/image2.jpg' &&
        artist.profileImage !== 'https://example.com/image3.jpg' ?
        `<img src="${artist.profileImage}" alt="${artist.displayName || artist.username}" 
                      style="width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 1;">` :
        `<div style="
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                    font-weight: bold;
                    position: relative;
                    z-index: 1;
                ">${initials}</div>`
    }
                </div>
                <div class="artist-info" style="flex: 1; min-width: 0; max-width: 100%;">
                    <h3 class="artist-name" style="margin: 0 0 5px 0; color: #fff; font-size: 1.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                        ${artist.displayName || artist.username || 'Artista'}
                    </h3>
                    <div style="display: flex; align-items: center; gap: 8px; color: #a0aec0; font-size: 0.85rem; flex-wrap: wrap;">
                        <svg style="width: 14px; height: 14px; fill: currentColor; flex-shrink: 0;" viewBox="0 0 24 24">
                            ${getPlatformSVGIconSmall(artist.icon || 'x')}
                        </svg>
                        <span class="artist-username" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">@${artist.username || 'usuario'}</span>
                    </div>
                </div>
            </div>
            <a href="${artist.mainUrl || '#'}" target="_blank" style="
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                background: linear-gradient(45deg, #000000 0%, ${getPlatformColor(artist.icon || 'x')} 100%);
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 0.85rem;
                width: 100%;
                box-sizing: border-box;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                z-index: 1;
                border: 1px solid rgba(255, 255, 255, 0.1);
                white-space: nowrap;
            ">
                ${platformIcon}
                ${buttonText}
            </a>
        </div>
    `;
}

function generateColorsFromUsername(e) {
    if (!e) return ["#FFD700", "#FFA500"];
    for (var n = [
            ["#FFD700", "#FFA500"],
            ["#C9AE5D", "#B8860B"],
            ["#D4AF37", "#996515"],
            ["#FFDF00", "#BFA900"],
            ["#FDD017", "#E6BE8A"],
            ["#FFC72C", "#DAA520"]
        ], t = 0, i = 0; i < e.length; i++) t = e.charCodeAt(i) + ((t << 5) - t);
    return n[Math.abs(t) % n.length]
}

function generateArtistColors(e) {
    if (!e) return ["#667eea", "#764ba2"];
    for (var n = [
            ["#667eea", "#764ba2"],
            ["#f093fb", "#f5576c"],
            ["#4facfe", "#00f2fe"],
            ["#43e97b", "#38f9d7"],
            ["#fa709a", "#fee140"],
            ["#30cfd0", "#330867"]
        ], t = 0, i = 0; i < e.length; i++) t = e.charCodeAt(i) + ((t << 5) - t);
    return n[Math.abs(t) % n.length]
}

function formatDate(e, n) {
    if (!e) return "N/A";
    try {
        var t = new Date(e);
        if (isNaN(t.getTime())) return e;
        var i = {
            year: "numeric",
            month: "long"
        };
        switch (n) {
            case "es":
                return t.toLocaleDateString("es-ES", i);
            case "ja":
                return t.toLocaleDateString("ja-JP", i);
            case "zh":
                return t.toLocaleDateString("zh-CN", i);
            case "zh_tw":
                return t.toLocaleDateString("zh-TW", i);
            default:
                return t.toLocaleDateString("en-US", i)
        }
    } catch (n) {
        return e
    }
}

function getInitials(e) {
    return e ? e.split(" ").map((function(e) {
        return e[0]
    })).join("").toUpperCase().substring(0, 2) : "??"
}

function getPlatformSVGIcon(e) {
    switch (e) {
        case "pixiv":
            return '<svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M4.5 7.5C4.5 5.843 5.843 4.5 7.5 4.5S10.5 5.843 10.5 7.5 9.157 10.5 7.5 10.5 4.5 9.157 4.5 7.5zM16.5 7.5c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zM4.5 16.5c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zM16.5 16.5c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z"/></svg>';
        case "instagram":
            return '<svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
        default:
            return '<svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    }
}

function getPlatformSVGIconSmall(e) {
    switch (e) {
        case "pixiv":
            return '<path d="M4.5 7.5C4.5 5.843 5.843 4.5 7.5 4.5S10.5 5.843 10.5 7.5 9.157 10.5 7.5 10.5 4.5 9.157 4.5 7.5zM16.5 7.5c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zM4.5 16.5c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zM16.5 16.5c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z"/>';
        case "instagram":
            return '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>';
        default:
            return '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>'
    }
}

function getPlatformColor(e) {
    switch (e) {
        case "pixiv":
            return "#0096FA";
        case "instagram":
            return "#E4405F";
        default:
            return "#1DA1F2"
    }
}

function changeLanguage(e) {
    if (["es", "en", "ja", "zh", "zh_tw"].includes(e)) {
        const n = document.getElementById("homeLanguageSelector");
        n && (n.value = e, currentLang = e, window.updateSectionVisibility(), "undefined" != typeof Storage && localStorage.setItem("selectedLanguage", e))
    }
}! function() {
    function e() {
        const e = document.getElementById("homeLanguageSelector");
        e && (e.value = currentLang, e.addEventListener("change", (function() {
            currentLang = this.value, updateSectionVisibility(), "undefined" != typeof Storage && localStorage.setItem("selectedLanguage", currentLang)
        })), function() {
            if ("undefined" != typeof Storage) {
                const e = localStorage.getItem("selectedLanguage");
                e && document.querySelector(`#homeLanguageSelector option[value="${e}"]`) && (currentLang = e, document.getElementById("homeLanguageSelector").value = e, updateSectionVisibility())
            }
        }())
    }

    function n() {
        document.querySelectorAll(".accordion").forEach((function(e) {
            let n = e.querySelectorAll(".accordion-header");
            n.forEach((function(e) {
                e.addEventListener("click", (function() {
                    const t = this.nextElementSibling,
                        i = this.classList.contains("active");
                    if (n.forEach((function(n) {
                            n !== e && (n.classList.remove("active"), n.nextElementSibling.classList.remove("open"))
                        })), i) this.classList.remove("active"), t.classList.remove("open");
                    else {
                        this.classList.add("active"), t.classList.add("open");
                        const e = this.getAttribute("data-lang"),
                            n = t.querySelector(".vip-container"),
                            i = t.querySelector(".ai-artists-container");
                        n ? loadVipMembers(e) : i && loadArtists(e)
                    }
                }))
            }))
        })), e(), window.updateSectionVisibility()
    }
    window.updateSectionVisibility = function() {
        var e = currentLang;
        document.querySelectorAll(".accordion").forEach((function(n, t) {
            let i = !1;
            n.querySelectorAll(".accordion-item").forEach((function(n) {
                const t = n.querySelector(".accordion-header"),
                    r = t.nextElementSibling;
                if (t.getAttribute("data-lang") === e)
                    if (n.style.display = "block", t.disabled = !1, t.style.opacity = "1", t.style.cursor = "pointer", i) t.classList.remove("active"), r.classList.remove("open");
                    else {
                        t.classList.add("active"), r.classList.add("open"), i = !0;
                        const n = r.querySelector(".vip-container"),
                            a = r.querySelector(".ai-artists-container");
                        n ? loadVipMembers(e) : a && loadArtists(e)
                    }
                else n.style.display = "none", t.classList.remove("active"), r.classList.remove("open"), t.disabled = !0, t.style.opacity = "0.5", t.style.cursor = "default"
            }))
        }))
    }, "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", n) : n()
}(),
function() {
    if (!document.querySelector("#promotion-styles")) {
        var e = document.createElement("style");
        e.id = "promotion-styles", e.textContent = "\n        .vip-card:hover {\n            transform: translateY(-5px);\n            box-shadow: 0 15px 30px rgba(255, 215, 0, 0.2);\n        }\n        \n        .artist-card:hover {\n            transform: translateY(-5px);\n            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);\n        }\n        \n        .vip-container a:hover, .ai-artists-container a:hover {\n            opacity: 0.9;\n            transform: scale(1.02);\n        }\n        \n        /* Integración con animaciones del theme.css */\n        .vip-card {\n            animation: goldBorderPulse 3s ease-in-out infinite;\n        }\n        \n        .vip-badge {\n            animation: badgeSpin 3s ease-in-out infinite;\n        }\n        \n        .artist-card {\n            border: 1px solid rgba(66, 153, 225, 0.3);\n            animation: artistBorderPulse 4s ease-in-out infinite;\n        }\n        \n        @keyframes artistBorderPulse {\n            0%, 100% {\n                border-color: rgba(66, 153, 225, 0.3);\n                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);\n            }\n            50% {\n                border-color: rgba(66, 153, 225, 0.7);\n                box-shadow: 0 12px 40px rgba(66, 153, 225, 0.2);\n            }\n        }\n        \n        .artist-card a:hover {\n            background: linear-gradient(45deg, #1a1a2e 0%, #1DA1F2 100%) !important;\n            box-shadow: 0 0 20px rgba(66, 153, 225, 0.4);\n        }\n    ", document.head.appendChild(e)
    }
}(), window.vipSystem = {
    loadVipMembers: loadVipMembers,
    updateSectionVisibility: window.updateSectionVisibility || function() {}
}, window.aiArtistsSystem = {
    loadArtists: loadArtists
}, window.changeLanguage = changeLanguage;

function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const containers = document.querySelectorAll('.vip-container, .ai-artists-container');
    
    containers.forEach(container => {
        if (isMobile) {
            container.style.gridTemplateColumns = '1fr';
            container.style.gap = '15px';
        } else {
            container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            container.style.gap = '20px';
        }
    });
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);

const originalUpdateSectionVisibility = window.updateSectionVisibility;
window.updateSectionVisibility = function() {
    originalUpdateSectionVisibility();
    handleResize();
};