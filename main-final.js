$("#pokemonSearchButton").on("click", handleSearch);

$("#pokemonName").on("keypress", function(event) {
    if (event.which === 13) {
        event.preventDefault(); 
        handleSearch();
    }
});

async function handleSearch() {
    try {
        const pokemonId = await searchPokemonByName();
        if (pokemonId) {
            const pokemonData = await fetchPokemonData(pokemonId);
            showPokemonData(pokemonData);
        }
    } catch (error) {
        console.error("処理中にエラーが発生しました:", error);
    }
}

const searchPokemonByName = async () => {
    const pokemonName = $("#pokemonName").val().trim();
    if (!pokemonName) {
        alert("ポケモンの名前を入力してください。");
        return null;
    }
    try {
        const response = await fetch('nameToId.json');
        if (!response.ok) {
            throw new Error('JSONファイルの読み込みに失敗しました。');
        }
        const pokemonNameMap = await response.json();
        if (pokemonNameMap.hasOwnProperty(pokemonName)) {
            return pokemonNameMap[pokemonName];
        } else {
            alert(`「${pokemonName}」というポケモンは見つかりませんでした。`);
            return null;
        }
    } catch (error) {
        console.error(error);
        alert('ポケモンデータの照合に失敗しました。');
        return null;
    }
};

const fetchPokemonData = (pokemonId) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
            type: 'GET',
            dataType: 'json',
            success: function(pokemonData) {
                const imageUrl = pokemonData.sprites.front_default;
                const types = pokemonData.types.map(typeInfo => typeInfo.type.name); 
                const height = pokemonData.height / 10;
                const weight = pokemonData.weight / 10;

                // 説明文だけは別途取得しなきゃいけない
                $.ajax({
                    url: pokemonData.species.url,
                    type: 'GET',
                    dataType: 'json',
                    success: function(speciesData) {
                        const flavorTextEntry = speciesData.flavor_text_entries.find(
                            (entry) => entry.language.name === "ja"
                        );
                        const description = flavorTextEntry 
                            ? flavorTextEntry.flavor_text.replace(/[\n\f]/g, " ") 
                            : "説明文が見つかりませんでした。";
                        
                        resolve({ imageUrl, types, height, weight, description });
                    },
                    error: function(request, status, error) {
                        reject(new Error("ポケモンの説明文を取得できませんでした: " + error));
                    }
                });
            },
            error: function(request, status, error) {
                reject(new Error("ポケモンのデータを取得できませんでした: " + error));
            }
        });
    });
};

const typeColors = {
    normal: { name: 'ノーマル', color: '#A8A878' },
    fire: { name: 'ほのお', color: '#F08030' },
    water: { name: 'みず', color: '#6890F0' },
    electric: { name: 'でんき', color: '#F8D030' },
    grass: { name: 'くさ', color: '#78C850' },
    ice: { name: 'こおり', color: '#98D8D8' },
    fighting: { name: 'かくとう', color: '#C03028' },
    poison: { name: 'どく', color: '#A040A0' },
    ground: { name: 'じめん', color: '#E0C068' },
    flying: { name: 'ひこう', color: '#A890F0' },
    psychic: { name: 'エスパー', color: '#F85888' },
    bug: { name: 'むし', color: '#A8B820' },
    rock: { name: 'いわ', color: '#B8A038' },
    ghost: { name: 'ゴースト', color: '#705898' },
    dragon: { name: 'ドラゴン', color: '#7038F8' },
    dark: { name: 'あく', color: '#705848' },
    steel: { name: 'はがね', color: '#B8B8D0' },
    fairy: { name: 'フェアリー', color: '#EE99AC' }
};

const showPokemonData = (pokemonData) => {
    $("#pokemonImage").attr("src", pokemonData.imageUrl);
    
    const typesContainer = $("#pokemonTypes");
    typesContainer.html("<strong>タイプ:</strong> "); // ラベルを先に追加
    
    // タイプの数だけ色付きのバッジを生成
    pokemonData.types.forEach(typeKey => {
        if (typeColors[typeKey]) {
            const typeInfo = typeColors[typeKey];
            const typeSpan = $('<span></span>')
                .text(typeInfo.name)
                .addClass('type-badge')
                .css('background-color', typeInfo.color);
            typesContainer.append(typeSpan);
        }
    });

    $("#pokemonHeight").html(`<strong>高さ:</strong> ${pokemonData.height} m`);
    $("#pokemonWeight").html(`<strong>重さ:</strong> ${pokemonData.weight} kg`);
    $("#pokemonDescription").text(pokemonData.description);
    
    $("#pokemonInfoContainer").show();
};