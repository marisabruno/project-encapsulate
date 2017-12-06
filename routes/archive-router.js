const express=require("express");
const router=express.Router();

//in order to use the Product Model, you have to require the productmodel...
//which you can use because it's been exported

const ArchiveModel=require("../models/archive-model");
const GroupModel=require("../models/group-model");

function loginRequired (req,res,next){
  if (req.user===undefined){
    res.redirect("/login");
    return;
  }
  next();
}



//SHOW MY ARCHIVES---------------------------------------------------------------------
//---------------------------------------------------------------------------------------
router.get("/my-archives", loginRequired, (req,res,next)=>{

  ArchiveModel.find({owner:req.user._id}).sort({dateAdded:-1}).exec()
    .then((archiveResults)=>{
      res.locals.myArchives=archiveResults;
      console.log(archiveResults);
      console.log("search successful!");
      res.render("archives");
    })
    .catch((err)=>{
      console.log("ERROR!");
      next(err);
    });
});


//Submit New Archive---------------------------------------------------------------------
//-------------------------------------------------------------------------------------
router.post("/my-archives", loginRequired,(req,res,next)=>{
  const theArchive=new ArchiveModel({
    title: req.body.archiveTitle,
    description: req.body.archiveDescription,
    imageUrl:req.body.archiveImage,
    // //when the product was added to the system
    dateAdded: new Date (),
    owner: req.user._id
    });

  theArchive.save()
    .then(()=>{
        console.log("Successful Save!");
        res.redirect("my-archives");
    })
    .catch((err)=>{
      next(err);
    });

});


//Share an archive---------------------------------------------------------------------
//------------------------------------------------------------------------------------
router.post("/share-archive", loginRequired,(req,res,next)=>{
  const theArchive=new ArchiveModel({
    title: req.body.archiveTitle,
    description: req.body.archiveDescription,
    imageUrl:req.body.archiveImage,
    // //when the product was added to the system
    dateAdded: new Date (),
    owner: req.user._id
    });
  theArchive.save()
    .then(()=>{
        const myGroups=req.user.groups;
        return GroupModel.find({_id:myGroups}).exec();
      })
    .then((allGroups)=>{
      console.log("Successful Save!");
      console.log(allGroups);
      res.locals.myGroups=allGroups;
      res.locals.archive=theArchive;
      res.render("archive-views/share-archive.ejs");
    })
    .catch((err)=>{
      next(err);
    });

});


//See Details of One Archive---------------------------------------------------------------------
//-------------------------------------------------------------------------------------

router.get("/my-archives/:archiveId",loginRequired,(req,res,next)=>{
  ArchiveModel.findById(req.params.archiveId)
    .then((archiveFromDb)=>{
      res.locals.archiveDetails=archiveFromDb;
      res.render("archive-details");
    })
    .catch((err)=>{
      next(err);
    });
});

//EDIT One Archive---------------------------------------------------------------------
//-------------------------------------------------------------------------------------

router.get("/my-archives/:archiveId/edit",loginRequired, (req,res,next)=>{
  ArchiveModel.findById(req.params.archiveId)
  .then((archiveFromDb)=>{
      res.locals.archiveDetails=archiveFromDb;
      res.render("archive-edit");
  })
  .catch();
});

//SAVE and POST Archive Edits---------------------------------------------------------------------
//-------------------------------------------------------------------------------------

router.post("/my-archives/:archiveId",loginRequired, (req,res,next)=>{
    ArchiveModel.findById(req.params.archiveId)
    .then((archiveFromDb)=>{
      archiveFromDb.set({
          title:req.body.archiveTitle,
          description:req.body.archiveDescription,
          imageUrl:req.body.archiveImage
      });
      return archiveFromDb.save();
    })
    .then(()=>{
        res.redirect(`/my-archives/${req.params.archiveId}`);
    })
    .catch((err)=>{
      next(err);
    });

});

//Delete Archives---------------------------------------------------------------------
//-------------------------------------------------------------------------------------

router.get("/my-archives/:archiveId/delete",(req,res,next)=>{
  ArchiveModel.findByIdAndRemove(req.params.archiveId)
    .then((archiveFromDb)=>{
      res.redirect(`/my-archives`);
    })
    .catch((err)=>{
      next(err);
    });
});




module.exports=router;
