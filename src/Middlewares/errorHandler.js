const errorHandler = (error, req, res, next) => {
  console.log(error);
  //   return res.status(500).json({ error: "Server error, try agin!" });
  return res.status(500).json(error.message);
};
