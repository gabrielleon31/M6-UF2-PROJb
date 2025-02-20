document.addEventListener("DOMContentLoaded", () => {
    const comunidadSelect = document.getElementById("ccaa");
    const provinciaSelect = document.getElementById("provincia");
    const poblacionSelect = document.getElementById("poblacion");
    const form = document.querySelector("form");
    const imageContainer = document.getElementById("image-container");

    fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json")
        .then(response => response.json())
        .then(data => {
            console.log("Data received:", data);
            if (!Array.isArray(data)) {
                console.error("Expected an array but got:", data);
                return;
            }
            data.forEach(comunidad => {
                let option = document.createElement("option");
                option.value = comunidad.code;
                option.textContent = comunidad.label;
                comunidadSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error loading Autonomous Communities:", error));

    comunidadSelect.addEventListener("change", () => {
        provinciaSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json")
            .then(response => response.json())
            .then(data => {
                let provincias = data.filter(prov => prov.parent_code === comunidadSelect.value);
                provincias.forEach(provincia => {
                    let option = document.createElement("option");
                    option.value = provincia.code;
                    option.textContent = provincia.label;
                    provinciaSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading Provinces:", error));
    });

    provinciaSelect.addEventListener("change", () => {
        poblacionSelect.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';

        fetch("https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json")
            .then(response => response.json())
            .then(data => {
                let poblaciones = data.filter(pobl => pobl.parent_code === provinciaSelect.value);
                poblaciones.forEach(poblacion => {
                    let option = document.createElement("option");
                    option.value = poblacion.label;
                    option.textContent = poblacion.label;
                    poblacionSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error loading Towns:", error));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        imageContainer.innerHTML = "";

        const selectedPoblacion = poblacionSelect.value;
        if (!selectedPoblacion) return alert("Selecciona una població.");

        const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(selectedPoblacion)}&gimlimit=10&prop=imageinfo&iiprop=url`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Wikimedia API Response:", data);
                if (!data.query) {
                    imageContainer.innerHTML = "<p>No s'han trobat imatges</p>";
                    return;
                }

                const images = Object.values(data.query.pages);
                images.forEach(image => {
                    const imageBox = document.createElement("div");
                    imageBox.classList.add("image-box");

                    const imgElement = document.createElement("img");
                    imgElement.src = image.imageinfo[0].url;
                    imgElement.alt = "Imatge de la població";

                    imgElement.addEventListener("click", () => {
                        if (imgElement.requestFullscreen) {
                            imgElement.requestFullscreen();
                        } else if (imgElement.mozRequestFullScreen) {
                            imgElement.mozRequestFullScreen();
                        } else if (imgElement.webkitRequestFullscreen) {
                            imgElement.webkitRequestFullscreen();
                        } else if (imgElement.msRequestFullscreen) {
                            imgElement.msRequestFullscreen();
                        }
                    });

                    imageBox.appendChild(imgElement);
                    imageContainer.appendChild(imageBox);
                });
            })
            .catch(error => {
                console.error("Error obtenint imatges:", error);
                imageContainer.innerHTML = "<p>Error carregant les imatges</p>";
            });
    });
});
