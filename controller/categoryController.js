const { Category } = require ('../models')

const getCategory = async (req, res) => {
    try{
        const categories = await Category.findAll() 
        
        if(categories.length === 0){
            return res.status(404).json({message: 'No categories found'})
            }
            res.status(200).json(categories)
            
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Error getting the data from the database'})
    }
} 

const getDocumentsByCategory = async (req, res) => {
    const { category } = req.query;
    try {
        // Gantikan "Document" dengan model dokumen yang Anda miliki
        const documents = await Document.findAll({ where: { category } });
        if (documents.length === 0) {
            return res.status(404).json({ message: 'No documents found for this category' });
        }
        res.status(200).json(documents);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error getting the documents from the database' });
    }
};


const createCategory = async (req, res) => {
    try{
        const newCategory = await Category.create({
            name : req.body.name
        })
        res.status(201).json({message: 'create data success', data : newCategory })
    } catch(err){
        console.log(err);
        res.status(500).json({ message: "Failed to create a new category"});
    }
}

const  updateCategory = async (req,res)=>{
    try{
        const updateCategory = await Category.update({
            name : req.body.name
        },{where:{id : req.params.id}})
        if(updateCategory[0]==0){
            res.status(404).json({message:"The Category with this id does not exist!"})
        }else{  
           res.status(200).json({message:"Updated Successfully!",data:updateCategory})  
        }
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Server Error!"});
    }
}

const deleteCategory = async(req, res) =>{
    try{
        const Category = await Category.destroy({ where: { id: req.params.id } });
        if(!Category){
            return res.status(400).json('Id is not valid')
        }
        res.status(200).json({message: 'delete success'})
        
    }catch(err){
        console.log(err);   
        res.status(500).json({message : 'Internal Server Error'})
    
    }
    
};

module.exports={ 
    getCategory, 
    getDocumentsByCategory,
    updateCategory, 
    deleteCategory, 
    createCategory 
};