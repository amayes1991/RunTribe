using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace RunTribe.Api.Models
{
    public class Cities
    {
        [Key]
        public Guid CityId { get; set; }
        public string CityName { get; set; }

        
    }
}