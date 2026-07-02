var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const dbConfig = require("./db.config.js");
var mysql = require("mysql");
const cors = require("cors");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
app.use(express.json());
//app.use(cors());const knex = require("knex");
const knex = require("knex");
app.use(cors());
app.use(express.json());

// INICIJALIZACIJA BAZE
const db = knex({
  client: "mysql2",
  connection: {
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
  },
});

app.use(
  cors({
    origin: "*",
  }),
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);



// connection configurations
var dbConn = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

// connect to database
dbConn.connect();

// Retrieve all plant_species
app.get("/plant_species", (request, response) => {
  dbConn.query("SELECT * FROM plant_species", (error, results) => {
    if (error) throw error;
    response.send({
      error: false,
      data: results,
      message: "plant_species list.",
    });
  });
});

// Retrieve all botanical families
app.get("/botanical_family", (request, response) => {
  dbConn.query("SELECT * FROM botanical_family", (error, results) => {
    if (error) throw error;
    response.send({
      error: false,
      data: results,
      message: "botanical_family list.",
    });
  });
});

// Retrieve plant_species with id
app.get("/plant_species/:id", (request, response) => {
  let plant_species_id = request.params.id;
  if (!plant_species_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide plant_species_id",
    });
  }
  dbConn.query(
    "SELECT * FROM plant_species where id=?",
    plant_species_id,
    (error, results) => {
      if (error) throw error;
      response.send({
        error: false,
        data: results[0],
        message: "plant_species detail.",
      });
    },
  );
});

// Retrieve plant_species by botanical_family id
app.get("/plant_species_by_bf/:id", (request, response) => {
  let botanical_family_id = request.params.id;
  if (!botanical_family_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide botanical_family_id",
    });
  }
  dbConn.query(
    `SELECT p.id, p.croatian_name, p.latin_name
     FROM plant_species AS p
     LEFT OUTER JOIN genus AS g ON p.genus_id=g.id
     LEFT OUTER JOIN botanical_family AS bf ON g.botanical_family_id=bf.id
     WHERE bf.id=?`,
    botanical_family_id,
    (error, results) => {
      if (error) throw error;
      response.send({
        error: false,
        data: results,
        message: "plant_species list by botanical_family.",
      });
    },
  );
});

// Retrieve botanical_family with id
app.get("/botanical_family/:id", (request, response) => {
  let botanical_family_id = request.params.id;
  if (!botanical_family_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide botanical_family_id",
    });
  }
  dbConn.query(
    "SELECT * FROM botanical_family where id=?",
    botanical_family_id,
    (error, results) => {
      if (error) throw error;
      response.send({
        error: false,
        data: results[0],
        message: "botanical_family detail.",
      });
    },
  );
});

// Retrieve all useful_part
app.get("/useful_part", (request, response) => {
  dbConn.query("SELECT * FROM useful_part", (error, results) => {
    if (error) throw error;
    response.send({
      error: false,
      data: results,
      message: "useful_part list.",
    });
  });
});

// Retrieve botanical_family for a plant_species
app.get("/botanical_family_plant_species/:id", (request, response) => {
  let plant_species_id = request.params.id;
  if (!plant_species_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide plant_species_id",
    });
  }
  dbConn.query(
    `SELECT botanical_family.id, botanical_family.croatian_name, botanical_family.latin_name
     FROM botanical_family
     LEFT JOIN genus ON botanical_family.id=genus.botanical_family_id
     LEFT JOIN plant_species ON genus.id=plant_species.genus_id
     WHERE plant_species.id=?`,
    plant_species_id,
    (error, results) => {
      if (error) throw error;
      response.send({
        error: false,
        data: results[0],
        message: "botanical_family for plant_species.",
      });
    },
  );
});

// Retrieve image for a plant_species
app.get("/image/:id", (request, response) => {
  let plant_id = request.params.id;
  if (!plant_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide plant_id",
    });
  }
  dbConn.query(
    `SELECT i.image_url
     FROM image i
     LEFT JOIN plant_species_image psi ON i.id=psi.image_id
     LEFT JOIN plant_species ps ON psi.plant_species_id=ps.id
     WHERE ps.id=? LIMIT 1`,
    plant_id,
    (error, results) => {
      if (error) throw error;
      response.send({
        error: false,
        data: results[0],
        message: "plant_species_image.",
      });
    },
  );
});

// Retrieve useful_part for a plant_species or useful_part by id
app.get("/useful_part/:id/:questionid", (request, response) => {
  let plant_species_id = request.params.id;
  let question_id = request.params.questionid;

  if (!plant_species_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide plant_species_id",
    });
  }

  if (question_id == 5) {
    dbConn.query(
      `SELECT ps.id, ps.croatian_name, up.croatian_name, up.latin_name
       FROM useful_part up
       LEFT OUTER JOIN plant_part pp ON up.id=pp.useful_part_id
       LEFT OUTER JOIN plant_species ps ON pp.plant_species_id=ps.id
       WHERE ps.id=?`,
      plant_species_id,
      (error, results) => {
        if (error) throw error;
        response.send({
          error: false,
          data: results,
          message: "plant_species_useful_parts.",
        });
      },
    );
  } else if (question_id == 6) {
    dbConn.query(
      "SELECT * FROM useful_part where id=?",
      plant_species_id,
      (error, results) => {
        if (error) throw error;
        response.send({
          error: false,
          data: results[0],
          message: "useful_part detail.",
        });
      },
    );
  }
});

// Dohvat biljnog roda za odreÄ‘enu biljnu vrstu, id biljne vrste
app.get("/genus/:id", function (request, response) {
  let plant_species_id = request.params.id;
  if (!plant_species_id) {
    return response.status(400).send({
      error: true,
      message: "Please provide plant_species_id",
    });
  }
  dbConn.query(
    "SELECT g.id, g.latin_name FROM genus g LEFT JOIN plant_species ps ON g.id=ps.genus_id WHERE ps.id=?", // SQL UPIT RADI
    plant_species_id,
    function (error, results, fields) {
      if (error) throw error;
      return response.send({
        error: false,
        data: results[0],
        message: "genus information.",
      });
    },
  );
});

// Kojoj botaniÄkoj porodici pripada biljka sa slikom
app.get("/plant_family_question", (req, res) => {
  const query = `
    SELECT bf.croatian_name AS family, ps.croatian_name AS plant_name
    FROM plant_species ps
    LEFT JOIN genus g ON ps.genus_id = g.id
    LEFT JOIN botanical_family bf ON g.botanical_family_id = bf.id
    LEFT JOIN image i ON ps.id = i.plant_species_id
    WHERE i.image_url IS NOT NULL
    ORDER BY RAND()
    LIMIT 1
  `;

  dbConn.query(query, (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const plant = results[0];
      const correctFamily = plant.family;

      // Prikupi ostale porodice za netoÄne odgovore
      const incorrectQuery = `
        SELECT DISTINCT bf.croatian_name
        FROM botanical_family bf
        WHERE bf.croatian_name != ?
        ORDER BY RAND()
        LIMIT 3
      `;

      dbConn.query(
        incorrectQuery,
        [correctFamily],
        (error, incorrectResults) => {
          if (error) throw error;

          // Kombiniraj toÄan i netoÄne odgovore
          const answers = [
            correctFamily,
            ...incorrectResults.map((row) => row.croatian_name),
          ];
          const shuffledAnswers = answers.sort(() => Math.random() - 0.5); // Random odgovor

          res.json({
            question: `Kojoj botaniÄkoj porodici pripada biljka sa slikom?`,
            answers: shuffledAnswers,
            correctAnswer: correctFamily,
          });
        },
      );
    } else {
      res.status(404).json({ message: "No plant found with an image." });
    }
  });
});

// dodavanje teÅ¾ine pitanja
app.get("/pitanje/:id", (req, res) => {
  let pitanje_id = req.params.id;
  if (!pitanje_id) {
    return res.status(400).send({
      error: true,
      message: "Please provide pitanje_id",
    });
  }

  dbConn.query(
    "SELECT * FROM pitanja WHERE id=?",
    pitanje_id,
    (error, results) => {
      if (error) throw error;
      res.send({
        error: false,
        data: results[0],
        message: "Pitanje detalji.",
      });
    },
  );
});

app.post('/register', (req, res) => {
  console.log('BODY:', req.body);

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Sva polja su obavezna' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Neispravan email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Lozinka je prekratka' });
  }

  if (name.length < 3) {
    return res.status(400).json({ message: 'KorisniÄko ime je prekratko' });
  }

  // EMAIL CHECK
  dbConn.query(
    'SELECT id FROM `user` WHERE email = ?',
    [email],
    async (err, results) => {

      if (err) {
        console.error('SELECT ERROR:', err);
        return res.status(500).json({ message: err.message });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Email veÄ‡ postoji' });
      }

      // USERNAME CHECK
      dbConn.query(
        'SELECT id FROM `user` WHERE username = ?',
        [name],
        async (err, usernameResults) => {

          if (err) {
            console.error('USERNAME CHECK ERROR:', err);
            return res.status(500).json({ message: err.message });
          }

          if (usernameResults.length > 0) {
            return res.status(409).json({ message: 'KorisniÄko ime veÄ‡ postoji' });
          }

          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const activationHash = crypto.randomBytes(32).toString('hex');

            dbConn.query(
              `INSERT INTO \`user\` (email, password, active, activation_hash, role_id, username)
               VALUES (?, ?, 1, ?, 1, ?)`,
              [email, hashedPassword, activationHash, name],
              (err, result) => {

                if (err) {
                  console.error('INSERT ERROR:', err);
                  return res.status(500).json({ message: err.message });
                }

                return res.status(201).json({
                  message: 'User registered'
                });
              }
            );

          } catch (hashError) {
            console.error('HASH ERROR:', hashError);
            return res.status(500).json({ message: 'Hash error' });
          }
        }
      );
    }
  );
});





app.post('/login', (req, res) => {
  console.log('BODY:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Neispravan email format' });
  }

  // 1. traÅ¾enje usera po emailu
  dbConn.query(
    'SELECT id, email, password, username, role_id, active FROM `user` WHERE email = ? LIMIT 1',
    [email],
    async (err, results) => {

      if (err) {
        console.error('SELECT ERROR:', err);
        return res.status(500).json({ message: err.message });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Neispravan email' });
      }

      const user = results[0];

      // 2. provjera lozinke
      try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return res.status(401).json({ message: 'Neispravna lozinka' });
        }

        // 3.  provjera da li je user aktivan
        if (user.active !== 1) {
          return res.status(403).json({ message: 'RaÄun nije aktiviran' });
        }

        // 4. login OK â†’ ovdje moÅ¾eÅ¡ napraviti JWT ili session
        const token = crypto.randomBytes(32).toString('hex');

        // spremanje session/token u bazu:
        dbConn.query(
          'UPDATE `user` SET refresh_token = ? WHERE id = ?',
          [token, user.id],
          (err2) => {
            if (err2) {
              console.error('TOKEN UPDATE ERROR:', err2);
              return res.status(500).json({ message: err2.message });
            }

            return res.status(200).json({
              message: 'UspjeÅ¡na prijava',
              token,
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role_id: user.role_id
              }
            });
          }
        );

      } catch (compareError) {
        console.error('BCRYPT ERROR:', compareError);
        return res.status(500).json({ message: 'GreÅ¡ka prilikom provjere lozinke' });
      }
    }
  );
});
//spremanje rezultata kviza u bazu
app.post('/save-score', (req, res) => {
  const { userId, score, brojTocnih, brojNetocnih } = req.body;

  if (
    !userId ||
    score == null ||
    brojTocnih == null ||
    brojNetocnih == null
  ) {
    return res.status(400).json({ message: 'Nedostaju podaci' });
  }

  dbConn.query(
    `INSERT INTO rezultati
    (user_id, rezultat, vrijeme, broj_tocnih, broj_netocnih, timestamp)
    VALUES (?, ?, 30, ?, ?, current_timestamp())`,
    [userId, score, brojTocnih, brojNetocnih],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'GreÅ¡ka u bazi podataka' });
      }

      console.log('Rezultat pohranjen');
      res.json({ message: 'Rezultat pohranjen' });
    }
  );
});


// dohvat statistike i povijesti rezultata za odreÄ‘enog usera
app.get('/user-stats/:id', (req, res) => {
  const userId = req.params.id;
  const range = req.query.range || 'all';

  let dateFilter = '';

  if (range === 'today') {
    dateFilter = 'AND DATE(timestamp) = CURDATE()';
  }

  if (range === 'week') {
    dateFilter = 'AND YEARWEEK(timestamp, 1) = YEARWEEK(CURDATE(), 1)';
  }

  if (range === 'month') {
    dateFilter = `
      AND MONTH(timestamp) = MONTH(CURDATE())
      AND YEAR(timestamp) = YEAR(CURDATE())
    `;
  }

  const statsQuery = `
    SELECT
      COUNT(*) AS total_games,
      MAX(rezultat) AS best_score,
      AVG(rezultat) AS avg_score,
      SUM(rezultat) AS total_points,
      SUM(broj_tocnih) AS total_correct,
      SUM(broj_netocnih) AS total_wrong,
      AVG(vrijeme) AS avg_time,
      MIN(vrijeme) AS best_time,
      SUM(vrijeme) AS total_time,
      MAX(timestamp) AS last_played
    FROM rezultati
    WHERE user_id = ?
    ${dateFilter}
  `;

  dbConn.query(statsQuery, [userId], (err, stats) => {
    if (err) return res.status(500).json({ message: err.message });

    const tableQuery = `
      SELECT rezultat, broj_tocnih, broj_netocnih, vrijeme, timestamp as created_at
      FROM rezultati
      WHERE user_id = ?
      ${dateFilter}
      ORDER BY timestamp DESC
    `;

    const chartQuery = `
      SELECT rezultat, timestamp as created_at
      FROM rezultati
      WHERE user_id = ?
      ${dateFilter}
      ORDER BY timestamp ASC
    `;

    dbConn.query(tableQuery, [userId], (err2, tableHistory) => {
      if (err2) return res.status(500).json({ message: err2.message });

      dbConn.query(chartQuery, [userId], (err3, chartHistory) => {
        if (err3) return res.status(500).json({ message: err3.message });

        res.json({
          stats: stats[0],
          tableHistory,
          chartHistory
        });
      });
    });
  });
});





// LEADERBOARD
app.get('/leaderboard', (req, res) => {
  const query = `
    SELECT
      u.id AS user_id,
      u.username,

      -- najbolji score korisnika
      MAX(r.rezultat) AS best_score,

      -- vrijeme rjeÅ¡avanja tog najboljeg scorea
      (
        SELECT r2.vrijeme
        FROM rezultati r2
        WHERE r2.user_id = u.id
        ORDER BY r2.rezultat DESC, r2.vrijeme ASC
        LIMIT 1
      ) AS best_score_time,

      -- datum kad je ostvaren najbolji rezultat
      (
        SELECT r3.timestamp
        FROM rezultati r3
        WHERE r3.user_id = u.id
        ORDER BY r3.rezultat DESC, r3.vrijeme ASC
        LIMIT 1
      ) AS best_score_date,

      ROUND(AVG(r.rezultat), 2) AS avg_score,
      COUNT(r.id_rezultata) AS total_games,
      SUM(r.broj_tocnih) AS total_correct,
      SUM(r.broj_netocnih) AS total_wrong,
      MIN(r.vrijeme) AS best_time,
      MAX(r.timestamp) AS last_played

    FROM user u
    INNER JOIN rezultati r ON r.user_id = u.id
    GROUP BY u.id, u.username
    ORDER BY best_score DESC, best_score_time ASC, avg_score DESC
    LIMIT 100
  `;

  dbConn.query(query, (err, results) => {
    if (err) {
      console.error('Leaderboard error:', err);
      return res.status(500).json({
        message: 'GreÅ¡ka kod dohvaÄ‡anja leaderboarda'
      });
    }

    res.json(results);
  });
});











// dohvat statistike i povijesti rezultata za odreÄ‘enog usera



//spremanje rezultata kviza u bazu


// Usporedba statistike ja vs prosjek
app.get('/compare-stats/:userId', (req, res) => {
  const userId = req.params.userId;

  // user stats
  const userQuery = `
  SELECT
  COALESCE(AVG(rezultat), 0) as avg_score,
  COALESCE(MAX(rezultat), 0) as best_score,
  COUNT(*) as total_games,

  COALESCE(AVG(vrijeme), 0) as avg_time,
  COALESCE(AVG(broj_tocnih), 0) as avg_correct,
  COALESCE(AVG(broj_netocnih), 0) as avg_wrong

  FROM rezultati
  WHERE user_id = ?


  `;

  // global stats
  const globalQuery = `
    SELECT
  COALESCE(AVG(rezultat), 0) as avg_score,
  COALESCE(MAX(rezultat), 0) as best_score,
  COUNT(*) as total_games,

  COALESCE(AVG(vrijeme), 0) as avg_time,
  COALESCE(AVG(broj_tocnih), 0) as avg_correct,
  COALESCE(AVG(broj_netocnih), 0) as avg_wrong

  FROM rezultati


  `;

  dbConn.query(userQuery, [userId], (err, userRes) => {
    if (err) return res.status(500).json(err);

    dbConn.query(globalQuery, (err2, globalRes) => {
      if (err2) return res.status(500).json(err2);

      res.json({
        my: userRes[0],
        global: globalRes[0]
      });
    });
  });
});

// Retrieve FunFact for a plant_species
app.get("/fun_fact/:id", (request, response) => {
  let plant_species_id = request.params.id;

  dbConn.query(
    "SELECT fun_fact FROM plant_fun_facts WHERE plant_species_id = ? LIMIT 1",
    [plant_species_id],
    (error, results) => {
      if (error) {
        return response.status(500).send({
          error: true,
          message: error.message,
        });
      }

      response.send({
        error: false,
        data: results[0],
        message: "fun_fact detail.",
      });
    }
  );
});

app.get("/api/PregledBiljaka", async (req, res) => {
  try {
    const biljke = await db("plant_species")
      .leftJoin("genus", "plant_species.genus_id", "genus.id")

      .select("plant_species.*", "genus.name as genus_name");

    res.json(biljke);
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri spajanju tablica" });
  }
});

app.get("/api/PregledBotanskihPorodica", async (req, res) => {
  try {
    const obitelji = await db("botanical_family").select("*");
    res.json(obitelji);
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri dohvatu botaniÄkih obitelji" });
  }
});

app.get("/api/genus_by_family/:id", async (req, res) => {
  try {
    const genus = await db("genus")
      .where({ botanical_family_id: req.params.id })
      .select("*");
    res.json(genus);
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri dohvatu rodova" });
  }
});

app.post("/api/botanical_family", async (req, res) => {
  try {
    const { croatian_name, latin_name } = req.body;
    const [id] = await db("botanical_family").insert({
      croatian_name,
      latin_name,
    });
    res.json({ id, croatian_name, latin_name });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri dodavanju porodice" });
  }
});

app.put("/api/botanical_family/:id", async (req, res) => {
  try {
    const { croatian_name, latin_name } = req.body;
    await db("botanical_family")
      .where({ id: req.params.id })
      .update({ croatian_name, latin_name });
    res.json({ id: req.params.id, croatian_name, latin_name });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri aÅ¾uriranju porodice" });
  }
});

app.delete("/api/botanical_family/:id", async (req, res) => {
  try {
    await db("botanical_family").where({ id: req.params.id }).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri brisanju porodice" });
  }
});

//  UrediBiljku: dohvat jedne biljke po ID-u
app.get('/api/plant_species/:id', async (req, res) => {
  try {
    const biljka = await db('plant_species').where({ id: req.params.id }).first()
    if (!biljka) return res.status(404).json({ error: 'Biljka nije pronaÄ‘ena' })
    res.json(biljka)
  } catch (error) {
    res.status(500).json({ error: 'GreÅ¡ka pri dohvatu biljke' })
  }
})
//  Pretraga biljke po nazivu
app.get('/api/pretraga_biljke', async (req, res) => {
  try {
    const naziv = req.query.naziv
    const rezultati = await db('plant_species')
      .where('croatian_name', 'like', `%${naziv}%`)
      .orWhere('latin_name', 'like', `%${naziv}%`)
      .select('id', 'croatian_name', 'latin_name')
      .limit(10)
    res.json(rezultati)
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: 'GreÅ¡ka pri pretrazi' })
  }
})

// UrediBiljku: dohvat svih rodova
app.get('/api/genus', async (req, res) => {
  try {
    const rodovi = await db('genus').select('id', 'name', 'botanical_family_id');
    res.json(rodovi);
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: 'GreÅ¡ka pri dohvatu rodova' });
  }
});

//  UrediBiljku: spremi promjene biljke
app.put('/api/plant_species/:id', async (req, res) => {
  try {
    const { croatian_name, latin_name, synonym, description, genus_id } = req.body;
    await db('plant_species')
      .where({ id: req.params.id })
      .update({ croatian_name, latin_name, synonym, description, genus_id });
    res.json({ success: true });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: 'GreÅ¡ka pri aÅ¾uriranju biljke' });
  }

});

app.get("/images", async (req, res) => {
  try {
    const speciesId = req.query.plant_species_id;

    const query = db("image as i")
      .select(
        "i.id",
        "i.name",
        "i.image_url",
        "i.description",
        "i.source",
        db.raw("GROUP_CONCAT(DISTINCT psi.plant_species_id) AS plant_species_ids"),
        db.raw("GROUP_CONCAT(DISTINCT ps.croatian_name SEPARATOR ', ') AS plant_species_names"),
        db.raw("GROUP_CONCAT(DISTINCT ps.latin_name SEPARATOR ', ') AS plant_species_latin_names"),
      )
      .leftJoin("plant_species_image as psi", "i.id", "psi.image_id")
      .leftJoin("plant_species as ps", "psi.plant_species_id", "ps.id")
      .groupBy("i.id", "i.name", "i.image_url", "i.description", "i.source");

    if (speciesId) {
      query.where("psi.plant_species_id", speciesId);
    }

    const images = await query;
    res.json({ error: false, data: images });
  } catch (error) {
    console.error("Image gallery load error:", error);
    res.status(500).json({ error: true, message: "Greska pri dohvatu slika" });
  }
});

app.post("/image", async (req, res) => {
  const { name, image_url, description, source, plant_species_id } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: true, message: "URL slike je obavezan" });
  }

  try {
    const imageId = await db.transaction(async (trx) => {
      const [id] = await trx("image").insert({
        name,
        image_url,
        description,
        source,
      });

      if (plant_species_id) {
        await trx("plant_species_image").insert({
          image_id: id,
          plant_species_id,
        });
      }

      return id;
    });

    res.status(201).json({ error: false, id: imageId, message: "Slika dodana" });
  } catch (error) {
    console.error("Image gallery insert error:", error);
    res.status(500).json({ error: true, message: "Greska pri dodavanju slike" });
  }
});

app.put("/image/:id", async (req, res) => {
  const imageId = req.params.id;
  const { name, image_url, description, source, plant_species_id } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: true, message: "URL slike je obavezan" });
  }

  try {
    await db.transaction(async (trx) => {
      await trx("image")
        .where({ id: imageId })
        .update({
          name,
          image_url,
          description,
          source,
        });

      await trx("plant_species_image").where({ image_id: imageId }).delete();

      if (plant_species_id) {
        await trx("plant_species_image").insert({
          image_id: imageId,
          plant_species_id,
        });
      }
    });

    res.json({ error: false, message: "Slika azurirana" });
  } catch (error) {
    console.error("Image gallery update error:", error);
    res.status(500).json({ error: true, message: "Greska pri azuriranju slike" });
  }
});

app.delete("/image/:id", async (req, res) => {
  const imageId = req.params.id;

  // brisanje slike
  try {
    await db.transaction(async (trx) => {
      await trx("plant_species_image").where({ image_id: imageId }).delete();
      await trx("image").where({ id: imageId }).delete();
    });

    res.json({ error: false, message: "Slika obrisana" });
  } catch (error) {
    console.error("Image gallery delete error:", error);
    res.status(500).json({ error: true, message: "Greska pri brisanju slike" });
  }
});

// ---- Galerija slika za dijelove biljaka (korisnička priča #138) ----

// Popis biljnih vrsta koje imaju barem jednu sliku vezanu uz neki dio biljke
// (koristi se za padajući izbornik u galeriji)
app.get("/plant_species_with_part_images", async (req, res) => {
  try {
    const rows = await db("plant_part_image as ppi")
      .distinct("ps.id", "ps.croatian_name", "ps.latin_name")
      .innerJoin("plant_species as ps", "ppi.plant_species_id", "ps.id")
      .orderBy("ps.croatian_name");
    res.json({ error: false, data: rows });
  } catch (error) {
    console.error("plant_species_with_part_images error:", error);
    res
      .status(500)
      .json({ error: true, message: "Greska pri dohvatu biljnih vrsta" });
  }
});

// Slike odabrane biljne vrste grupirane po dijelu biljke
// Vraca svaki dio biljke (useful_part) s pripadajucim popisom slika
app.get("/plant_part_images/:plant_species_id", async (req, res) => {
  const plantSpeciesId = req.params.plant_species_id;
  if (!plantSpeciesId) {
    return res
      .status(400)
      .json({ error: true, message: "Nedostaje plant_species_id" });
  }

  try {
    const rows = await db("plant_part as pp")
      .select(
        "pp.useful_part_id",
        "up.croatian_name as part_croatian_name",
        "up.latin_name as part_latin_name",
        "pp.description as part_description",
        "i.id as image_id",
        "i.name as image_name",
        "i.description as image_description",
        "i.source as image_source",
        "i.image_url as image_url",
        "i.upload_date as image_upload_date",
      )
      .innerJoin("useful_part as up", "pp.useful_part_id", "up.id")
      .leftJoin("plant_part_image as ppi", function () {
        this.on("ppi.plant_species_id", "pp.plant_species_id").andOn(
          "ppi.useful_part_id",
          "pp.useful_part_id",
        );
      })
      .leftJoin("image as i", "ppi.image_id", "i.id")
      .where("pp.plant_species_id", plantSpeciesId)
      .orderBy(["up.croatian_name", "i.id"]);

    // grupiranje redova po dijelu biljke
    const parts = [];
    const byPart = {};
    for (const r of rows) {
      if (!byPart[r.useful_part_id]) {
        byPart[r.useful_part_id] = {
          useful_part_id: r.useful_part_id,
          croatian_name: r.part_croatian_name,
          latin_name: r.part_latin_name,
          description: r.part_description,
          images: [],
        };
        parts.push(byPart[r.useful_part_id]);
      }
      if (r.image_id) {
        byPart[r.useful_part_id].images.push({
          id: r.image_id,
          name: r.image_name,
          description: r.image_description,
          source: r.image_source,
          image_url: r.image_url,
          upload_date: r.image_upload_date,
        });
      }
    }

    res.json({ error: false, data: parts });
  } catch (error) {
    console.error("plant_part_images load error:", error);
    res.status(500).json({
      error: true,
      message: "Greska pri dohvatu slika dijelova biljke",
    });
  }
});

app.listen(3000, function () {
  console.log("Node app is running on port 3000");
});

//Dodavanje biljke admin dio

app.post("/api/dodajBiljku", async (req, res) => {
  const {
    croatian_name,
    latin_name,
    synonym,
    description,
    genus_id
  } = req.body;

  try {
    await db("plant_species").insert({
      croatian_name,
      latin_name,
      synonym,
      description,
      genus_id
    });

    res.json({ message: "Biljka uspjeÅ¡no dodana" });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri unosu biljke" });
  }
});
//kraj dodavana
app.delete("/api/obrisiBiljku/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db("plant_species")
      .where({ id })
      .del();

    res.json({ message: "Biljka uspjeÅ¡no obrisana" });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri brisanju biljke" });
  }
});

app.get("/api/PregledRodova", async (req, res) => {
  try {
    const genus = await db("genus").select("*");
    res.json(genus);
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res
      .status(500)
      .json({ error: "GreÅ¡ka pri dohvatu podataka iz tablice genus" });
  }
});

// Dodaj genus
app.post("/api/genus", async (req, res) => {
  try {
    const { name, botanical_family_id } = req.body;
    const [id] = await db("genus").insert({ name, botanical_family_id });
    res.json({ id, name, botanical_family_id });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri dodavanju roda" });
  }
});

// Uredi genus
app.put("/api/genus/:id", async (req, res) => {
  try {
    const { name } = req.body;
    await db("genus").where({ id: req.params.id }).update({ name });
    res.json({ id: req.params.id, name });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri aÅ¾uriranju roda" });
  }
});

// ObriÅ¡i genus
app.delete("/api/genus/:id", async (req, res) => {
  try {
    await db("genus").where({ id: req.params.id }).delete();
    res.json({ success: true });
  } catch (error) {
    console.error("SQL GreÅ¡ka:", error);
    res.status(500).json({ error: "GreÅ¡ka pri brisanju roda" });
  }
});

module.exports = app;
