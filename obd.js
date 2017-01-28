// openbd.jp API Search 
if(!oBD) var oBD = {} ;
oBD.search = function(isbn,cb) {
	if(!isbn) return ;
	$.ajax({
			url:"https://api.openbd.jp/v1/get?isbn="+isbn,
			type:"GET",dataType:'json',crossDomain:true,
			success:function(json) {
				var data = $(json)[0] ;
				var b = json[0].onix ;
	
				var DD = b.DescriptiveDetail ;		
				var CD = b.CollateralDetail ;
				var PD = b.PublishingDetail ;
				var PS = b.ProductSupply ;

				var s = {ISBN:b.RecordReference} ;
				if(DD.ProductComposition) s.Bunbai = DD.ProductComposition ;
				if(DD.ProductForm=="BA") {
					s.Hankei = DD.ProductFormDetail ;
				}
				if(DD.Measure) {
					for(i in DD.Measure) {
						if(DD.Measure[i].MeasureType=="01") s.SizeTate = DD.Measure[i].Measurement + DD.Measure[i].MeasureUnitCode ;
						if(DD.Measure[i].MeasureType=="02") s.SizeYoko = DD.Measure[i].Measurement + DD.Measure[i].MeasureUnitCode ;
					}
				}
				if(DD.ProductPart) {
					s.Furoku = [] ;
					for(i in DD.ProductPart){
						s.Furoku.push(DD.ProductPart[i].ProductFormDescription)
					}
				}
				if(DD.Collection) {
					if(DD.Collection.CollectionSequence) s.HaihonKaisu = DD.Collection.CollectionSequence.CollectionSequenceNumber ;
					if(DD.Collection.TitleDetail) {
						for(i in DD.Collection.TitleDetail.TitleElement) {
							var te = DD.Collection.TitleDetail.TitleElement[i] ;
							if(te.TitleElementLevel=="03") {
								if(te.PartNumber) s.SeriesKanji = te.PartNumber ;
								s.Series = te.TitleText.content ;
								s.SeriesYomi = te.TitleText.collationkey ;
							}
							if(te.TitleElementLevel=="02") {
								s.Label = te.TitleText.content ;
								s.LabelYomi = te.TitleText.collationkey ;
							}
						}
					}
				}
				if(DD.TitleDetail) {
					s.Title = DD.TitleDetail.TitleElement.TitleText.content ;
					s.TitleYomi = DD.TitleDetail.TitleElement.TitleText.collationkey ;
					if(DD.TitleDetail.TitleElement.Subtitle) {
						s.SubTitle = DD.TitleDetail.TitleElement.Subtitle.content ;
						s.SubTitleYomi = DD.TitleDetail.TitleElement.Subtitle.collationkey ;
					}
				}
				if(DD.Contributor) {
					var authors = [] ;
					for(i in DD.Contributor) {
						var au = DD.Contributor[i] ;
						var author = {} ;
						if(au.SequenceNumber) author.Seq = author.SequenceNumber ;
						author.Role = au.ContributorRole ;
						author.Name = au.PersonName.content ;
						author.NameYomi = au.PersonName.collationkey ;
						if(au.BiographicalNote) author.Bio = au.BiographicalNote ;
						authors.push(author) ;
					}
					s.Authors = authors ;
				}
				if(DD.Language) {
					var lang = [] ;
					for(i in DD.Language) {
						lang.push(DD.Language[i].LanguageCode) ;
					}
					s.Language = lang ;
				}
				if(DD.Extent) {
					s.Pages = DD.Extent[0].ExtentValue ;
				}
				if(DD.Subject) {
					for(i in DD.Subject) {
						var sbj = DD.Subject[i] ;
						switch(sbj.SubjectSchemeIdentifier) {
							case "20":
								s.Keyword = sbj.SubjectHeadingText ;
								break ;
							case "78":
								s.Ccode = sbj.SubjectCode ;
								break ;
							case "79":
								s.GenreCode = sbj.SubjectCode ;
								break ;
						}
					}
				}
				if(DD.Audience) {
					for(i in DD.Audience) {
						var aud = DD.Audience[i] ;
						if(aud.AudienceCodeType == "21") s.Jidousho = aud.AudienceCodeValue ;
						if(aud.AudienceCodeType == "22" && aud.AudienceCodeValue!="00") s.Seijinsitei = aud.AudienceCodeValue ;
					}
				}
				if(CD.TextContent) {
					for(i in CD.TextContent) {
						var text = CD.TextContent[i] ;
						switch(text.TextType) {
							case "02":
								s.ShortDescription = text.Text ; break ;
							case "03":
								s.Description = text.Text ;break ;
							case "04":
								s.Mokuji = text.Text ;break ;
						}
					}
				}
				if(CD.SupportingResource)　{
					var cover = [] ;
					var image = [] ;
					for(i in CD.SupportingResource) {
						var sr = CD.SupportingResource[i] ;
						if(sr.ResourceContentType=="01") cover.push(sr.ResourceVersion[0].ResourceLink) ;
						if(sr.ResourceContentType=="07") image.push(sr.ResourceVersion[0].ResourceLink) ;
					}
					if(cover.length>0) s.Cover = cover ;
					if(image.length>0) s.Image = image ;
				}
				
				if(PD.Imprint) {
					for(i in PD.Imprint.ImprintIdentifier) {
						switch(PD.Imprint.ImprintIdentifier[i].ImprintIDType) {
							case "19":
								s.HakkouShuppanshaCode = PD.Imprint.ImprintIdentifier[i].IDValue ; break ;
							case "24":
								s.HakkouTorihikiCode = PD.Imprint.ImprintIdentifier[i].IDValue ; break ;
						}
					}
					s.Hakkou = PD.Imprint.ImprintName ;
				}
				if(PD.Publisher) {
					for(i in PD.Publisher.PublisherIdentifier) {
						switch(PD.Publisher.PublisherIdentifier[i].PublisherIDType) {
							case "19":
								s.HatubaiShuppanshaCode = PD.Publisher.PublisherIdentifier[i].IDValue ; break ;
							case "24":
								s.HatubaiTorihikiCode = PD.Publisher.PublisherIdentifier[i].IDValue ; break ;
						}
					}
					s.Hatubai = PD.Publisher.PublisherName ;
				}
				
				if(PD.PublishingDate) {
					for(i in PD.PublishingDate ) {
						switch(PD.PublishingDate[i].PublishingDateRole) {
							case "01":
								s.HatubaiDate = PD.PublishingDate[i].Date ; break ;
							case "02":
								s.HatubaiKyouteiDate = PD.PublishingDate[i].Date ; break ;
							case "09":
								s.HatubaiKaikinDate = PD.PublishingDate[i].Date ; break ;
							case "25":
								s.YoyakuShimekiriDate = PD.PublishingDate[i].Date ; break ;
						}
					}
				}
				
				if(PS.SupplyDetail) {
					if(PS.SupplyDetail.ReturnsConditions) {
						s.ItakuKaikiri = PS.SupplyDetail.ReturnsConditions.ReturnsCode ;
					}
					if(PS.SupplyDetail.Price) {
						for(i in PS.SupplyDetail.Price) {
							var pr =  PS.SupplyDetail.Price[i] ;
							switch(pr.PriceType) {
								case "01":
								case "03":
									s.Kakaku = pr.PriceAmount ; break ;
								case "11":
								case "13":
									s.Tokka = pr.PriceAmount; break ;
							}
							if(pr.PriceDate)  {
								for(ii in pr.PriceDate) {
									switch(pr.PriceDate[ii].PriceDateRole) {
										case "14":
											s.TokkaKaishiDate = pr.PriceDate[ii].Date ;break ;
										case "15":
											s.TokkaKigenDate = pr.PriceDate[ii].Date ;break ;
									}
								}
							}
							
						}
					}
				}
				cb({onix:s,hanmoto:data.hanmoto}) ;
			},
			error:function(obj,st) {
				alert(st) ;
				cb(null) ;
			}
		}
	)
}


oBD.genre={"文芸":"1","新書":"2","社会一般":"3","資格・試験":"4","ビジネス":"5","スポーツ・健康":"6","趣味・実用":"7","ゲーム":"9","芸能・タレント":"10","テレビ・映画化":"11","芸術":"12","哲学・宗教":"13","歴史・地理":"14","社会科学":"15","教育":"16","自然科学":"17","医学":"18","工業・工学":"19","コンピュータ":"20","語学・辞事典":"21","学参":"22","児童図書":"23","ヤングアダルト":"24","新刊セット":"29","全集":"30","文庫":"31","コミック文庫":"36","コミックス(欠)":"41","コミックス(雑)":"42","コミックス(書)":"43","コミックス(廉)":"44","ムック":"51","雑誌":"71","増刊":"81","別冊":"86"};
oBD.author_role={"著":"A01","編":"B01","監修":"B20","翻訳":"B06","画、イラスト":"A12","写真":"A08","原作":"A38","原案":"A10","解説":"A21","朗読":"E07"};
oBD.hankei = {"4-6" :"B119","4-6変" :"B120","B6" :"B110","B6変" :"B125","A5" :"B108","A5変" :"B123","新書" :"B112","B5" :"B109","B5変" :"B124","A4" :"B121","A4変" :"B122","文庫" :"B111","B4" :"B130","AB" :"B126","菊" :"B128","菊変" :"B129"}

oBD.genreText=function(p) {
	for(c in oBD.genre) {
		if(parseInt(p)==parseInt(oBD.genre[c])) return c ;
	}
	return null ;
}
oBD.author_roleText=function(p) {
	for(c in oBD.author_role) {
		if(p==oBD.author_role[c]) return c ;
	}
	return null ;
}
