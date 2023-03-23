var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: true }},
    releaseDate: { type: String, required: true },
    genre: {
    type: String, 
    enum:["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mystery","Thriller","Western","Science Fiction",] },
    actors: [
        { actorname:{ type: String, required: true }, characterName: { type: String, required: true}},
       // { actorname:{ type: String, required: true }, characterName: { type: String, required: true}},
       // { actorname:{ type: String, required: true }, characterName: { type: String, required: true}}
        ],

});

MovieSchema.pre('save', function(next){

    next();
})

// return the model
module.exports = mongoose.model('Movie', MovieSchema);
