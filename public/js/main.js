$(function(){

    function getAll() {
        /* Metoda JQuery, která umožňuje použití AJAX */
        $.ajax({
            /* Adresa požadavku */
            url: 'http://localhost:3000/players',
            type: 'GET', // typ použité metody
            dataType: 'json', // formát přijímaných dat
            cache: true, // možnost využití vyrovnávací paměti
            /* V případě úspěšné odpovědi serveru - její součástí jsou posílaná data, stavová zpráva a xhr (XMLHTTPRequest objekt) */
            success: (data, textStatus, xhr) => {
                /* Vyčistí obsah elementu (tbody) s id="list" */
                $('#list').html(''); 
                /* Prochází všechna data (pole objektů) */
                data.forEach(player => {
                    /* Do proměnné row sestaví podobu jednoho řádku tabulky a vyplní buňky daty o hráčích.
                       Součástí každého řádku je odkaz umožňující editaci záznamu o hráči a tlačítko pro vymazání záznamu.
                       Důležitou roli v tomto případě hraje atribut data-id, do něhož je vždy uloženo id hráče 
                    */
                    let row = `<tr>
                        <td>${player.id}</td><td><a href="#" data-id="${player.id}">${player.name}</a></td>
                        <td>${player.state}</td>
                        <td>${player.points}</td>
                        <td><button class="btn btn-danger delete" data-id="${player.id}">Smazat</button></td>
                        </tr>`;
                    /* Přidá nový řádek do elementu */    
                    $('#list').append(row);
                });
                /* Reakce na akci kliknutí na odkaz se jménem hráče */
                $('#list a').on('click', function() {
                    /* Je vyvolána funkce getById, která zajistí zobrazení okna s možností editace daného hráče. 
                       K identifikaci záznamu se využije id hráče vložené do atributu data-id. */
                    getById($(this).data('id'));
                }); 
                /* Reakce na akci kliknutí na button Smazat */
                $('.delete').on('click', function() {
                    /* Metoda deleteById provede vymazání vybraného hráče */
                    deleteById($(this).data('id'));
                }); 
            },
            /* V případě chyby se v konzoli objeví chybové hlášení */
            error: (xhr, textStatus, errorThrown) => {
                console.log(errorThrown);
            }
        })
    }

    /* Získá jeden záznam o hráči podle id */
    function getById(id) {
        $.ajax({
            url: 'http://localhost:3000/players/' + id,
            type: 'GET',
            dataType: 'json',
            cache: false,
            success: (data, textStatus, xhr) => {
                console.log(textStatus);
                console.log(data);
                /* Vloží získaná data do jednotlivých prvků formuláře */
                $('#id').val(data.id);
                $('#name').val(data.name);
                $('#state').val(data.state);
                $('#points').val(data.points);
                /* Vyvolá zobrazení dialogového okna s formulářem */
                $('#modelId').modal('show');
            },
            error: (xhr, textStatus, errorThrown) => {
                console.log(errorThrown);
            }
        })
    }

    /* Smaže záznam hráče podle id */
    function deleteById(id) {
        $.ajax({
            url: 'http://localhost:3000/players/' + id,
            type: 'DELETE',
            dataType: 'json',
            cache: false,
            success: (data, textStatus, xhr) => {
                console.log(textStatus);
                console.log(data);
                /* Vypíše aktualizovaný seznam hráčů */
                getAll();
            },
            error: (xhr, textStatus, errorThrown) => {
                console.log(errorThrown);
            }
        })
    }

    /* Vytvořit nový záznam o hráči - funkce je vyvolána po stisku tlačítka Uložit v dialogovém okně */
    function create(data) {
        $.ajax({
            url: 'http://localhost:3000/players',
            type: 'POST',
            data: data,
            dataType: 'json',            
            contentType: 'application/json',
            success: (data, textStatus, xhr) => {
                console.log(textStatus);
                console.log(data);
                getAll();
            },
            error: (xhr, textStatus, errorThrown) => {
                console.log(errorThrown);
            }
        })
    }

    /* Editovat záznam o hráči -  - funkce je vyvolána po stisku tlačítka Uložit v dialogovém okně */
    function update(id, data) {
        $.ajax({
            url: 'http://localhost:3000/players/' + id,
            type: 'PUT',
            data: data,
            dataType: 'json',
            contentType: 'application/json',
            success: (data, textStatus, xhr) => {
                console.log(textStatus);
                console.log(data);
                getAll();
            },
            error: (xhr, textStatus, errorThrown) => {
                console.log(errorThrown);
            }
        })
    }

    /* Ošetření akce při stisku tlačítka Uložit (id="submit") */
    $('button#submit').on('click', () => {
        /* Do objektu json jsou postupně vloženy všechny údaje z formulářových prvků dialogového okna */
        let json = {};
        json.name = $('#name').val();
        json.state = $('#state').val();
        json.points = $('#points').val();
        /* Objekt json je převeden na řetezec ve formátu JSON a uložen do proměnné data */
        let data = JSON.stringify(json);
        /* Pokud formulářový prvek označený id="id" není prázdný (obsahuje id hráče), vyvolá se funkce update  */
        if ($('#id').val()) {
            update($('#id').val(), data);
        } else {
            /* v opačném případě se vytvoří nový záznam pomocí funkce create */
            create(data);
        }
    });

    /* Ošetření akce při stisku tlačítka Nový (id="create") */
    $('button#create').on('click', () => {
        /* Všechny hodnoty formulářových prvků se vyprázdní */
        $('#id').val('');
        $('#name').val('');
        $('#state').val('');
        $('#points').val('');
    });

    /* Úvodní výpis všech záznamů (hráčů) */
    getAll();    

})